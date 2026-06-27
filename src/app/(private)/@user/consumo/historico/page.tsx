import { redirect } from "next/navigation";

export default function ConsumoHistoricoPage() {
    redirect("/consumo?tab=historico");
}
