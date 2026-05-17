namespace Faultline.Services;

public class QueueService
{
    private readonly SemaphoreSlim _semaphore = new(1, 1);
    private int _queueCount = 0;
    private const int MaxQueueSize = 5;
    private readonly Lock _lock = new();

    public async Task<QueueEntry> EnqueueAsync(CancellationToken ct = default)
    {
        lock (_lock)
        {
            if (_queueCount >= MaxQueueSize)
                return QueueEntry.Rejected("We're at capacity right now. Try again in a few minutes.");

            _queueCount++;
        }

        var position = _queueCount;

        try
        {
            await _semaphore.WaitAsync(ct);
            return QueueEntry.Accepted(position);
        }
        catch
        {
            lock (_lock) { _queueCount--; }
            return QueueEntry.Rejected("Request was cancelled.");
        }
    }

    public void Release()
    {
        lock (_lock) { _queueCount = Math.Max(0, _queueCount - 1); }
        _semaphore.Release();
    }

    public int QueueCount => _queueCount;
}

public class QueueEntry
{
    public bool IsAccepted { get; private set; }
    public string Message { get; private set; } = string.Empty;
    public int Position { get; private set; }

    public static QueueEntry Accepted(int position) => new() { IsAccepted = true, Position = position };
    public static QueueEntry Rejected(string message) => new() { IsAccepted = false, Message = message };
}
