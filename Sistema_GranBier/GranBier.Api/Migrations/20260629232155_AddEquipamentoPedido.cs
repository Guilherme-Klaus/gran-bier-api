using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GranBier.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEquipamentoPedido : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Equipamentos_Pedidos_PedidoId",
                table: "Equipamentos");

            migrationBuilder.DropIndex(
                name: "IX_Equipamentos_PedidoId",
                table: "Equipamentos");

            migrationBuilder.DropColumn(
                name: "DataPedido",
                table: "Pedidos");

            migrationBuilder.DropColumn(
                name: "PedidoId",
                table: "Equipamentos");

            migrationBuilder.AddColumn<int>(
                name: "EquipamentoId",
                table: "Pedidos",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EquipamentoId",
                table: "Pedidos");

            migrationBuilder.AddColumn<DateTime>(
                name: "DataPedido",
                table: "Pedidos",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "PedidoId",
                table: "Equipamentos",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Equipamentos_PedidoId",
                table: "Equipamentos",
                column: "PedidoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Equipamentos_Pedidos_PedidoId",
                table: "Equipamentos",
                column: "PedidoId",
                principalTable: "Pedidos",
                principalColumn: "Id");
        }
    }
}
