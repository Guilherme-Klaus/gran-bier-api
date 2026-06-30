using System.ComponentModel.DataAnnotations;

namespace GranBier.Api.Models
{
    public class MovimentacaoCaixas
    {
        [Key]
        public int Id { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public string Tipo { get; set; } = "Saida"; 
        public decimal Valor { get; set; }
        public DateTime Data { get; set; } = DateTime.Now;
        
        // NOVO: Controle de Dinheiro, Cartão ou PIX
        public string FormaPagamento { get; set; } = string.Empty; 
    }
}