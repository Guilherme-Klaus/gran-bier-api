using System.ComponentModel.DataAnnotations;

namespace GranBier.Api.Models
{
    public class Pedido
    {
        [Key]
        public int Id { get; set; }

        public int ClienteId { get; set; }
        public Cliente? Cliente { get; set; }

        public string EquipamentoIds { get; set; } = string.Empty;

        public DateTime DataEvento { get; set; }
        public string MarcaBarril { get; set; } = string.Empty;
        public int TamanhoBarrilLitros { get; set; }
        public bool PagamentoAberto { get; set; }
        public decimal ValorTotal { get; set; }
        
        // NOVO: Controle de Dinheiro, Cartão ou PIX
        public string FormaPagamento { get; set; } = string.Empty; 
        
        public bool Concluido { get; set; } = false; 
    }
}