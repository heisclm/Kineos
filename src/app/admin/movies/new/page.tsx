import { MovieForm } from "@/components/admin/MovieForm";

export const metadata = {
  title: { absolute: "Add Movie | Kineos Admin" },
};

export default function NewMoviePage() {
  return (
    <div className="w-full">
      <MovieForm />
    </div>
  );
}
