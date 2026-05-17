using Faultline.Services;
using Faultline.Agents;
using DotNetEnv;

Env.Load();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",
            "https://faultline-nzo.vercel.app"
        )
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

builder.Services.AddHttpClient<OllamaService>(client =>
{
    var baseUrl = builder.Configuration["Ollama:BaseUrl"] ?? "http://localhost:11434/";
    client.BaseAddress = new Uri(baseUrl);
    client.Timeout = TimeSpan.FromSeconds(180);
});

builder.Services.AddHttpClient<GroqService>(client =>
{
    var baseUrl = builder.Configuration["Groq:BaseUrl"] ?? "https://api.groq.com/openai/v1/";
    client.BaseAddress = new Uri(baseUrl);
    client.Timeout = TimeSpan.FromSeconds(30);
});

builder.Services.AddScoped<AIServiceFactory>();
builder.Services.AddScoped<ClassifierAgent>();
builder.Services.AddScoped<ClarifierAgent>();
builder.Services.AddScoped<AnalyzerAgent>();
builder.Services.AddScoped<ResearcherAgent>();
builder.Services.AddScoped<FormatterAgent>();

builder.Services.AddSingleton<RateLimitService>();
builder.Services.AddSingleton<QueueService>();

var app = builder.Build();

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();
