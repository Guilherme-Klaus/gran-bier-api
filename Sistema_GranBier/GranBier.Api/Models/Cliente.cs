namespace GranBier.Api.Models
{
    public class Cliente
    {
        public int Id { get; set; }
        public string NomeCompleto { get; set; } = string.Empty;
        public DateTime DataNascimento { get; set; }
        public string Cpf { get; set; } = string.Empty;
        public string Endereco { get; set; } = string.Empty;
        public string Observacoes { get; set; } = string.Empty;
        
        public List<Pedido> HistoricoDePedidos { get; set; } = new List<Pedido>();
    }
}