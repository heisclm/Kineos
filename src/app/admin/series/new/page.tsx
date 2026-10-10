import { SeriesForm } from "@/components/admin/SeriesForm";

export const metadata = {
  title: { absolute: "Add Series | Kineos Admin" },
};

export default function NewSeriesPage() {
  return (
    <div className="w-full">
      <SeriesForm />
    </div>
  );
}
