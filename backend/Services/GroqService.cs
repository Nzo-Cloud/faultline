using System.Net.Http.Json;
using System.Text.Json;

namespace Faultline.Services;

public class GroqService
{
    private readonly HttpClient _http;
    private readonly string _model;

    public GroqService(HttpClient http, IConfiguration config)
    {
        _http = http;
        _model = config["Groq:Model"] ?? "llama-3.1-8b-instant";

        var apiKey = Environment.GetEnvironmentVariable("GROQ_API_KEY")
                     ?? config["Groq:ApiKey"]
                     ?? throw new InvalidOperationException("Groq API key not found.");

        _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
    }

    public async Task<string> CompleteAsync(string prompt, CancellationToken ct = default)
    {
        var payload = new
        {
            model = _model,
            messages = new[]
            {
                new { role = "user", content = prompt }
            },
            max_tokens = 1000
        };

        var response = await _http.PostAsJsonAsync("chat/completions", payload, ct);

        if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
        {
            // Wait 15 seconds and retry once
            await Task.Delay(15000, ct);
            response = await _http.PostAsJsonAsync("chat/completions", payload, ct);
        }

        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: ct);
        return json
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? string.Empty;
    }
}
