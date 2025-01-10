using System.Net.WebSockets;
using System.Text;
using System.Collections.Concurrent;
using Newtonsoft.Json;

namespace backend;

public class Program
{
    private static readonly ConcurrentDictionary<string, WebSocket> ConnectedUsers = new();

    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateSlimBuilder(args);

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowOrigins", policy =>
            {
                policy.WithOrigins("http://localhost:5173", "http://192.168.0.129:5173")
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });

        var app = builder.Build();

        app.UseWebSockets();

        app.Map("/chat", async context =>
        {
            var username = context.Request.Query["username"].ToString();

            if (!context.WebSockets.IsWebSocketRequest)
            {
                var validationError = ValidateUsername(username);

                if (validationError != null)
                {
                    context.Response.StatusCode = 400;
                    await context.Response.WriteAsync(validationError);
                }

                return;
            }

            var socket = await context.WebSockets.AcceptWebSocketAsync();
            await HandleWebSocketConnection(socket, username);
        });

        app.UseCors("AllowOrigins");

        app.Run();
    }

    private static string? ValidateUsername(string username)
    {
        if (string.IsNullOrWhiteSpace(username))
        {
            return "Username is required";
        }

        if (ConnectedUsers.ContainsKey(username))
        {
            return "Username is already taken";
        }

        return null;
    }

    private static async Task HandleWebSocketConnection(WebSocket socket, string username)
    {
        try
        {
            ConnectedUsers[username] = socket;
            await BroadcastSystemMessage($"{username} has joined the chat");

            var buffer = new byte[1024 * 4];
            while (socket.State == WebSocketState.Open)
            {
                var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                if (result.MessageType == WebSocketMessageType.Text)
                {
                    var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    var request = JsonConvert.DeserializeObject<WebSocketRequest>(message);

                    if (request == null) continue;

                    switch (request.Type)
                    {
                        case "chat-message":
                            await BroadcastMessage(new WebSocketResponse
                            {
                                Username = username,
                                Message = request.Message ?? string.Empty
                            });
                            break;

                        default:
                            await SendMessage(socket, new WebSocketResponse
                            {
                                Type = "error",
                                Message = "Unknown request type"
                            });
                            break;
                    }
                }
                else if (result.MessageType == WebSocketMessageType.Close)
                {
                    break;
                }
            }
        }
        finally
        {
            ConnectedUsers.TryRemove(username, out _);
            await BroadcastSystemMessage($"{username} has left the chat");
            await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Connection closed", CancellationToken.None);
        }
    }

    private static async Task BroadcastMessage(WebSocketResponse message)
    {
        var payload = JsonConvert.SerializeObject(message);

        foreach (var socket in ConnectedUsers.Values)
        {
            if (socket.State == WebSocketState.Open)
            {
                var data = Encoding.UTF8.GetBytes(payload);
                await socket.SendAsync(new ArraySegment<byte>(data), WebSocketMessageType.Text, true, CancellationToken.None);
            }
        }
    }

    private static async Task BroadcastSystemMessage(string message)
    {
        await BroadcastMessage(new WebSocketResponse
        {
            Message = message
        });
    }

    private static async Task SendMessage(WebSocket socket, WebSocketResponse response)
    {
        var payload = JsonConvert.SerializeObject(response);
        var data = Encoding.UTF8.GetBytes(payload);
        await socket.SendAsync(new ArraySegment<byte>(data), WebSocketMessageType.Text, true, CancellationToken.None);
    }
}

public class WebSocketRequest
{
    public string? Type { get; set; }
    public string? Username { get; set; }
    public string? Message { get; set; }
}

public class WebSocketResponse
{
    public string? Type { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? Message { get; set; }
}
