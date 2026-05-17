using System.Net.Http.Json;
using System.Text.Json;

namespace Faultline.Services;

public class OllamaService
{
    private readonly HttpClient _http;
    private readonly string _model;

    public OllamaService(HttpClient http, IConfiguration config)
    {
        _http = http;
        _model = config["Ollama:Model"] ?? "llama3.1:8b";
    }

    public async Task<string> CompleteAsync(string prompt, CancellationToken ct = default)
    {
        var payload = new
        {
            model = _model,
            prompt = prompt,
            stream = false
        };

        var response = await _http.PostAsJsonAsync("api/generate", payload, ct);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: ct);
        return json.GetProperty("response").GetString() ?? string.Empty;
    }
}
