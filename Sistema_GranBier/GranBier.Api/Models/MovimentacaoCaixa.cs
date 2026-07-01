using System;
using System.ComponentModel.DataAnnotations;

namespace GranBier.Api.Models
{
    public class MovimentacaoCaixa
    {
        [Key]
        public int Id { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public string Tipo { get; set; } = "Saida"; // Entrada ou Saida
        public decimal Valor { get; set; }
        public DateTime Data { get; set; } = DateTime.Now;
        public string FormaPagamento { get; set; } = string.Empty; 
    }
}