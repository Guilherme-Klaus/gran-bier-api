using Microsoft.EntityFrameworkCore;
using GranBier.Api.Models;

namespace GranBier.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Cliente> Clientes { get; set; }
        public DbSet<Equipamento> Equipamentos { get; set; }
        public DbSet<Pedido> Pedidos { get; set; }
        public DbSet<MovimentacaoCaixa> MovimentacaoCaixa { get; set; }
    }
}