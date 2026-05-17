namespace Faultline.Services;

public class RateLimitService
{
    private readonly Dictionary<string, List<DateTime>> _requestLog = new();
    private readonly Lock _lock = new();

    private const int MaxPerTwoMinutes = 1;
    private const int MaxPerHour = 5;
    private const int MaxPerDay = 10;

    public RateLimitCheckResult Check(string ip)
    {
        lock (_lock)
        {
            var now = DateTime.UtcNow;

            if (!_requestLog.ContainsKey(ip))
                _requestLog[ip] = new List<DateTime>();

            var log = _requestLog[ip];

            // Clean old entries beyond 24 hours
            log.RemoveAll(t => now - t > TimeSpan.FromHours(24));

            var inLastTwoMinutes = log.Count(t => now - t < TimeSpan.FromMinutes(2));
            var inLastHour = log.Count(t => now - t < TimeSpan.FromHours(1));
            var inLastDay = log.Count;

            if (inLastTwoMinutes >= MaxPerTwoMinutes)
            {
                var next = log.Where(t => now - t < TimeSpan.FromMinutes(2))
                              .Min(t => t)
                              .AddMinutes(2);
                var wait = (int)(next - now).TotalSeconds;
                return RateLimitCheckResult.Denied($"Too many requests. Next analysis available in {wait} seconds.");
            }

            if (inLastHour >= MaxPerHour)
                return RateLimitCheckResult.Denied("Hourly limit reached (5/hour). Try again later.");

            if (inLastDay >= MaxPerDay)
                return RateLimitCheckResult.Denied("Daily limit reached (10/day). Come back tomorrow.");

            return RateLimitCheckResult.Allowed();
        }
    }

    public void Record(string ip)
    {
        lock (_lock)
        {
            if (!_requestLog.ContainsKey(ip))
                _requestLog[ip] = new List<DateTime>();
            _requestLog[ip].Add(DateTime.UtcNow);
        }
    }
}

public class RateLimitCheckResult
{
    public bool IsAllowed { get; private set; }
    public string Message { get; private set; } = string.Empty;

    public static RateLimitCheckResult Allowed() => new() { IsAllowed = true };
    public static RateLimitCheckResult Denied(string message) => new() { IsAllowed = false, Message = message };
}
