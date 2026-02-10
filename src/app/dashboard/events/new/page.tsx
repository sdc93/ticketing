import { getUserId } from "@/lib/auth";
export default async function NewEvent() {
  const uid = await getUserId();
  if (!uid) return <div>Necesitas login.</div>;
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Nuevo evento</h1>
      <form action="/api/events" method="post" className="space-y-3">
        <input name="title" placeholder="Título" required/>
        <input name="slug" placeholder="Slug (unico)" required/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input name="city" placeholder="Ciudad" required/>
          <input name="venue" placeholder="Venue (opcional)"/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select name="category" defaultValue="clubbing">
            <option value="clubbing">Clubbing</option><option value="ocio">Ocio</option><option value="gastronomia">Gastronomía</option>
            <option value="cultura">Cultura</option><option value="deporte">Deporte</option><option value="otros">Otros</option>
          </select>
          <input name="starts_at" type="datetime-local" required/>
        </div>
        <textarea name="description" placeholder="Descripción" rows={6}/>
        <input name="cover_url" placeholder="Cover URL (por ahora)"/>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" name="age_18" value="1" className="accent-zinc-100"/> +18
        </label>
        <button className="px-4 py-2 bg-zinc-100 text-zinc-950">Crear</button>
      </form>
    </div>
  );
}
