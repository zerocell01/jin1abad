import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uploadPhotos } from "./actions";

export default async function UploadPhotosPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/login");

  const { data: album } = await supabase
    .from("albums")
    .select("id, title")
    .eq("id", params.id)
    .single();

  if (!album) notFound();

  return (
    <div className="max-w-md">
      <p className="font-mono text-xs uppercase tracking-widest text-maroon mb-2">
        Upload Foto
      </p>
      <h1 className="font-display text-3xl mb-6">{album.title}</h1>

      <form action={uploadPhotos} className="flex flex-col gap-4">
        <input type="hidden" name="album_id" value={album.id} />
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Pilih Foto (bisa lebih dari satu)</label>
          <input
            type="file"
            name="photos"
            accept="image/*"
            multiple
            required
            className="w-full text-sm"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase mb-1">Caption (opsional, untuk semua foto)</label>
          <input
            name="caption"
            className="w-full border border-line rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-maroon"
          />
        </div>
        <button
          type="submit"
          className="bg-maroon text-paper px-4 py-2 rounded-sm mt-2 hover:bg-maroon-dark w-fit"
        >
          Upload
        </button>
      </form>
    </div>
  );
}
