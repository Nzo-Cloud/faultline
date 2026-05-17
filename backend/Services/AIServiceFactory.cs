namespace Faultline.Services;

public class AIServiceFactory
{
    private readonly OllamaService _ollama;
    private readonly GroqService _groq;
    private readonly string _provider;

    public AIServiceFactory(OllamaService ollama, GroqService groq, IConfiguration config)
    {
        _ollama = ollama;
        _groq = groq;
        _provider = config["Provider"] ?? "groq";
    }

    public Task<string> CompleteAsync(string prompt, CancellationToken ct = default)
    {
        return _provider.ToLower() == "ollama"
            ? _ollama.CompleteAsync(prompt, ct)
            : _groq.CompleteAsync(prompt, ct);
    }
}
