namespace GranBier.Api.Models
{
    public class Pedido
    {
        public int Id { get; set; }
        
        public int ClienteId { get; set; }
        public Cliente? Cliente { get; set; }
        
        public DateTime DataPedido { get; set; } = DateTime.Now;
        public DateTime DataEvento { get; set; }
        
        public string MarcaBarril { get; set; } = string.Empty;
        public int TamanhoBarrilLitros { get; set; }
        
        public List<Equipamento> EquipamentosAlocados { get; set; } = new List<Equipamento>();
        
        public bool PagamentoAberto { get; set; } = true;
        public decimal ValorTotal { get; set; }
    }
}