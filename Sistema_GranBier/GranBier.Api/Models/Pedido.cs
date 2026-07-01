using System;
using System.ComponentModel.DataAnnotations;

namespace GranBier.Api.Models
{
    public class Pedido
    {
        [Key]
        public int Id { get; set; }

        public string NumeroPedido { get; set; } = string.Empty;

        public int ClienteId { get; set; }
        public Cliente? Cliente { get; set; }

        public string EquipamentoIds { get; set; } = string.Empty;
        public DateTime DataEvento { get; set; }
        public string MarcaBarril { get; set; } = string.Empty;
        
        // Logística de volumes
        public int QtdBarril20L { get; set; }
        public int QtdBarril30L { get; set; }
        public int QtdBarril50L { get; set; }
        
        // Controlo Financeiro parcelado
        public decimal ValorTotal { get; set; }
        public decimal ValorPagoReserva { get; set; }
        public decimal SaldoAPagar { get; set; }
        public string StatusPagamento { get; set; } = string.Empty;
        public string FormaPagamento { get; set; } = string.Empty; 
        
        public bool PagamentoAberto { get; set; }
        public bool Concluido { get; set; } = false; 
    }
}