using System.IO.Compression;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using MarkDownEditor;

if (args.Length != 3)
{
    Console.Error.WriteLine("usage: UpdateValidation <portable-zip> <portable-dir> <setup-exe>");
    return 2;
}

var portableZip = args[0];
var portableDir = args[1];
var setupExe = args[2];
var failures = new List<string>();
var type = typeof(MainWindow);
var assemblyVersion = type.Assembly.GetName().Version ?? new Version(0, 0, 0);
var currentVersion = new Version(assemblyVersion.Major, assemblyVersion.Minor, assemblyVersion.Build);

MethodInfo Method(string name) => type.GetMethod(name, BindingFlags.NonPublic | BindingFlags.Static)
    ?? throw new MissingMethodException(type.FullName, name);

object? Invoke(string name, params object?[] values)
{
    try { return Method(name).Invoke(null, values); }
    catch (TargetInvocationException e) when (e.InnerException != null) { throw e.InnerException; }
}

async Task InvokeAsync(string name, params object?[] values)
{
    var task = (Task?)Invoke(name, values) ?? throw new InvalidOperationException($"{name} did not return Task");
    await task;
}

void Pass(string name) => Console.WriteLine($"PASS {name}");
void Fail(string name, Exception? error = null)
{
    failures.Add(name);
    Console.Error.WriteLine($"FAIL {name}{(error == null ? "" : $": {error.GetType().Name}: {error.Message}")}");
}

void ExpectSuccess(string name, Action action)
{
    try { action(); Pass(name); }
    catch (Exception e) { Fail(name, e); }
}

void ExpectInvalid(string name, Action action)
{
    try { action(); Fail(name); }
    catch (InvalidDataException) { Pass(name); }
    catch (Exception e) { Fail(name, e); }
}

async Task ExpectSuccessAsync(string name, Func<Task> action)
{
    try { await action(); Pass(name); }
    catch (Exception e) { Fail(name, e); }
}

async Task ExpectInvalidAsync(string name, Func<Task> action)
{
    try { await action(); Fail(name); }
    catch (InvalidDataException) { Pass(name); }
    catch (Exception e) { Fail(name, e); }
}

async Task<(long Size, string Sha)> AssetInfo(string path)
{
    var size = new FileInfo(path).Length;
    await using var stream = File.OpenRead(path);
    return (size, Convert.ToHexString(await SHA256.HashDataAsync(stream)).ToLowerInvariant());
}

string ReadDigest(string json)
{
    using var doc = JsonDocument.Parse(json);
    return (string?)Invoke("ReadSha256Digest", doc.RootElement) ?? "";
}

foreach (var asset in new[] { portableZip, setupExe })
{
    var info = await AssetInfo(asset);
    await ExpectSuccessAsync($"size and SHA-256: {Path.GetFileName(asset)}", () =>
        InvokeAsync("VerifyDownloadedUpdateAsync", asset, info.Size, info.Sha));
    await ExpectInvalidAsync($"SHA-256 mismatch: {Path.GetFileName(asset)}", () =>
        InvokeAsync("VerifyDownloadedUpdateAsync", asset, info.Size, new string('0', 64)));
    await ExpectInvalidAsync($"size mismatch: {Path.GetFileName(asset)}", () =>
        InvokeAsync("VerifyDownloadedUpdateAsync", asset, info.Size + 1, info.Sha));
}

var portableInfo = await AssetInfo(portableZip);
ExpectSuccess("valid digest normalization", () =>
{
    if (ReadDigest($$"""{"digest":"sha256:{{portableInfo.Sha.ToUpperInvariant()}}"}""") != portableInfo.Sha)
        throw new InvalidDataException("digest was not normalized");
});
ExpectSuccess("missing digest rejected", () =>
{
    if (ReadDigest("{}") != "") throw new InvalidDataException("missing digest was accepted");
});
ExpectSuccess("malformed digest rejected", () =>
{
    if (ReadDigest("{\"digest\":\"sha256:not-a-hash\"}") != "")
        throw new InvalidDataException("malformed digest was accepted");
});

foreach (var assetName in new[] { "MarkDownEditor-standalone.zip", "MarkDownEditor-Setup-x64.exe" })
    ExpectSuccess($"official URL accepted: {assetName}", () =>
    {
        var url = $"https://github.com/jjw1270/MarkdownEditor/releases/download/v{currentVersion}/{assetName}";
        if (Invoke("IsAllowedUpdateUrl", url) is not true) throw new InvalidDataException("official URL rejected");
    });
foreach (var badUrl in new[]
         {
             "http://github.com/jjw1270/MarkdownEditor/releases/download/v1.3.0/MarkDownEditor-standalone.zip",
             "https://github.com/attacker/MarkdownEditor/releases/download/v9.9.9/MarkDownEditor-standalone.zip",
             "https://example.com/MarkDownEditor-standalone.zip",
         })
    ExpectSuccess($"untrusted URL rejected: {badUrl}", () =>
    {
        if (Invoke("IsAllowedUpdateUrl", badUrl) is not false) throw new InvalidDataException("untrusted URL accepted");
    });

ExpectSuccess("exact release tag", () =>
{
    if (!Equals(Invoke("ParseReleaseVersion", $"v{currentVersion}"), currentVersion))
        throw new InvalidDataException("release tag rejected");
});
foreach (var tag in new[] { "1.3.0", "vv1.3.0", "v1.3", "v1.3.0.0", "v1.3.0-preview", "v1.+3.0" })
    ExpectSuccess($"invalid tag rejected: {tag}", () =>
    {
        try { Invoke("ParseReleaseVersion", tag); }
        catch (FormatException) { return; }
        throw new InvalidDataException("invalid tag accepted");
    });

ExpectSuccess("published portable structure", () => Invoke("ValidateUpdateArchive", portableZip));
ExpectSuccess("published portable version", () => Invoke("ValidateExtractedPayload", portableDir, currentVersion));
ExpectSuccess("published installer version", () => Invoke("ValidateExecutableVersion", setupExe, currentVersion));
ExpectInvalid("portable version mismatch", () =>
    Invoke("ValidateExtractedPayload", portableDir, new Version(9, 9, 9)));
ExpectInvalid("installer version mismatch", () =>
    Invoke("ValidateExecutableVersion", setupExe, new Version(9, 9, 9)));

var temp = Path.Combine(Path.GetTempPath(), "MDE-UpdateValidation-" + Guid.NewGuid().ToString("N"));
Directory.CreateDirectory(temp);
try
{
    string MakeZip(string name, params string[] entries)
    {
        var path = Path.Combine(temp, name);
        using var zip = ZipFile.Open(path, ZipArchiveMode.Create);
        foreach (var entryName in entries)
        {
            var entry = zip.CreateEntry(entryName);
            using var writer = new StreamWriter(entry.Open(), Encoding.UTF8);
            writer.Write("x");
        }
        return path;
    }

    var required = new[] { "MarkDownEditor.exe", "web/index.html", "Runtime/msedgewebview2.exe" };
    ExpectSuccess("minimal allowed archive", () =>
    {
        var expanded = (long)(Invoke("ValidateUpdateArchive", MakeZip("valid.zip", required)) ?? -1L);
        if (expanded <= 0) throw new InvalidDataException("expanded size was not reported");
    });
    ExpectInvalid("unexpected root", () =>
        Invoke("ValidateUpdateArchive", MakeZip("extra.zip", [.. required, "secret.txt"])));
    ExpectInvalid("path traversal", () =>
        Invoke("ValidateUpdateArchive", MakeZip("traversal.zip", [.. required, "../escape.txt"])));
    ExpectInvalid("missing runtime", () =>
        Invoke("ValidateUpdateArchive", MakeZip("missing.zip", "MarkDownEditor.exe", "web/index.html")));
    ExpectInvalid("duplicate entry", () =>
        Invoke("ValidateUpdateArchive", MakeZip("duplicate.zip", [.. required, "web/index.html"])));
    ExpectInvalid("ambiguous empty path segment", () =>
        Invoke("ValidateUpdateArchive", MakeZip("empty-segment.zip", [.. required, "web//extra.js"])));
    ExpectInvalid("ambiguous dot path segment", () =>
        Invoke("ValidateUpdateArchive", MakeZip("dot-segment.zip", [.. required, "web/./extra.js"])));
    ExpectInvalid("alternate data stream path", () =>
        Invoke("ValidateUpdateArchive", MakeZip("ads.zip", [.. required, "web/extra.js:payload"])));
    ExpectInvalid("trailing-dot path", () =>
        Invoke("ValidateUpdateArchive", MakeZip("trailing-dot.zip", [.. required, "web/extra.js."])));
    ExpectInvalid("symbolic link entry", () =>
    {
        var path = MakeZip("symlink.zip", required);
        using (var zip = ZipFile.Open(path, ZipArchiveMode.Update))
        {
            var link = zip.CreateEntry("web/link.js");
            link.ExternalAttributes = unchecked((int)0xA1FF0000);
        }
        Invoke("ValidateUpdateArchive", path);
    });

    await ExpectSuccessAsync("overlapping saves preserve request order", async () =>
    {
        var path = Path.Combine(temp, "ordered-save.md");
        var gate = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
        var first = (Task?)Invoke("SaveFileQueuedAsync", gate.Task, path, "older")
            ?? throw new InvalidDataException("first save did not return Task");
        var second = (Task?)Invoke("SaveFileQueuedAsync", first, path, "newest")
            ?? throw new InvalidDataException("second save did not return Task");
        gate.SetResult(true);
        await Task.WhenAll(first, second);
        if (File.ReadAllText(path) != "newest")
            throw new InvalidDataException("an older save overwrote the newest request");
    });

    ExpectSuccess("helper rollback on locked executable", () =>
    {
        var app = Path.Combine(temp, "rollback-app");
        var payload = Path.Combine(app, ".update", "payload");
        foreach (var item in new[] { "web", "Runtime" })
        {
            Directory.CreateDirectory(Path.Combine(app, item));
            File.WriteAllText(Path.Combine(app, item, "state.txt"), "old");
            Directory.CreateDirectory(Path.Combine(payload, item));
            File.WriteAllText(Path.Combine(payload, item, "state.txt"), "new");
        }
        var liveExe = Path.Combine(app, "MarkDownEditor.exe");
        File.WriteAllText(liveExe, "old");
        File.WriteAllText(Path.Combine(payload, "MarkDownEditor.exe"), "new");

        var generated = (string?)Invoke("WriteHelperScript", app, payload)
            ?? throw new InvalidDataException("helper was not generated");
        var helper = Path.Combine(temp, "rollback-helper.ps1");
        var waitLine = $"try {{ Wait-Process -Id {Environment.ProcessId} -Timeout 120 -ErrorAction SilentlyContinue }} catch {{}}";
        File.WriteAllText(helper, File.ReadAllText(generated).Replace(waitLine, "# parent wait bypassed by rollback test"),
            new UTF8Encoding(encoderShouldEmitUTF8Identifier: true));

        using var held = new FileStream(liveExe, FileMode.Open, FileAccess.ReadWrite, FileShare.Read);
        using var helperProcess = System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
        {
            FileName = "powershell.exe",
            Arguments = $"-NoProfile -ExecutionPolicy Bypass -File \"{helper}\"",
            UseShellExecute = false,
            CreateNoWindow = true,
        }) ?? throw new InvalidDataException("helper process did not start");
        if (!helperProcess.WaitForExit(20_000))
        {
            helperProcess.Kill(entireProcessTree: true);
            throw new TimeoutException("rollback helper did not finish");
        }
        held.Dispose();
        if (File.ReadAllText(liveExe) != "old" ||
            File.ReadAllText(Path.Combine(app, "web", "state.txt")) != "old" ||
            File.ReadAllText(Path.Combine(app, "Runtime", "state.txt")) != "old" ||
            File.Exists(liveExe + ".old") || Directory.Exists(Path.Combine(app, "web.old")) ||
            Directory.Exists(Path.Combine(app, "Runtime.old")))
            throw new InvalidDataException("helper did not restore the original application");

        File.Delete(generated);
    });
}
finally
{
    Directory.Delete(temp, recursive: true);
}

Console.WriteLine($"TOTAL failures={failures.Count}");
return failures.Count == 0 ? 0 : 1;
