
import { Search, SlidersHorizontal } from "lucide-react";

export default function FilterBar({
  search,
  setSearch,
  area,
  setArea,
}) {
  return (
    <div className="filter-bar">
      <label className="search-input">
        <Search size={19} />
        <input
          type="search"
          placeholder="Cari nama kamera atau lokasi..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>

      <label className="area-filter">
        <SlidersHorizontal size={17} />
        <select
          value={area}
          onChange={(event) => setArea(event.target.value)}
          aria-label="Filter wilayah"
        >
          <option>Semua Wilayah</option>
          <option>Kota Bogor</option>
          <option>Kabupaten Bogor</option>
        </select>
      </label>
    </div>
  );
}
