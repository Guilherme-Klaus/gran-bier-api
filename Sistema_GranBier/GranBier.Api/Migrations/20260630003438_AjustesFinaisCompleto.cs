using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GranBier.Api.Migrations
{
    /// <inheritdoc />
    public partial class AjustesFinaisCompleto : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_MovimentacoesCaixa",
                table: "MovimentacoesCaixa");

            migrationBuilder.DropColumn(
                name: "EquipamentoId",
                table: "Pedidos");

            migrationBuilder.DropColumn(
                name: "Tipo",
                table: "Equipamentos");

            migrationBuilder.RenameTable(
                name: "MovimentacoesCaixa",
                newName: "MovimentacaoCaixa");

            migrationBuilder.AddColumn<string>(
                name: "EquipamentoIds",
                table: "Pedidos",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Cep",
                table: "Clientes",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MovimentacaoCaixa",
                table: "MovimentacaoCaixa",
                column: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_MovimentacaoCaixa",
                table: "MovimentacaoCaixa");

            migrationBuilder.DropColumn(
                name: "EquipamentoIds",
                table: "Pedidos");

            migrationBuilder.DropColumn(
                name: "Cep",
                table: "Clientes");

            migrationBuilder.RenameTable(
                name: "MovimentacaoCaixa",
                newName: "MovimentacoesCaixa");

            migrationBuilder.AddColumn<int>(
                name: "EquipamentoId",
                table: "Pedidos",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Tipo",
                table: "Equipamentos",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MovimentacoesCaixa",
                table: "MovimentacoesCaixa",
                column: "Id");
        }
    }
}
