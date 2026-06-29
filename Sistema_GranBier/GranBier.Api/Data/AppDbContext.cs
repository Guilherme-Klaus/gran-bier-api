using Microsoft.EntityFrameworkCore;
using GranBier.Api.Models;

namespace GranBier.Api.Data
{
    public class AppDbContext : DbContext
    {
        // Esse construtor passa as configurações para o Entity Framework
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Aqui nós dizemos quais classes vão virar tabelas no banco!
        public DbSet<Cliente> Clientes { get; set; }
        public DbSet<Equipamento> Equipamentos { get; set; }
        public DbSet<Pedido> Pedidos { get; set; }
        public DbSet<MovimentacaoCaixa> MovimentacoesCaixa { get; set; }
    }
}