using Microsoft.EntityFrameworkCore;
using GranBier.Api.Data;
using System.Text.Json.Serialization; // 1. ADICIONE ESTA LINHA AQUI NO TOPO!

var builder = WebApplication.CreateBuilder(args);

// Configurando o Banco de Dados
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. SUBSTITUA O AddControllers() POR ESTE BLOCO ABAIXO:
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
}); 

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapControllers(); 
app.Run();