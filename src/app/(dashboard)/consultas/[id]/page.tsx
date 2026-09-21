import { ConsultationDetail } from "@/components/consultations/ConsultationDetail";

export default async function ConsultationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ConsultationDetail id={id} />;
}
