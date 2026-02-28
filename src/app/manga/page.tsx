import { MediaPage } from "@/components/MediaPage";

export default function MangaPage() {
  return (
    <MediaPage
      mediaType="MANGA"
      apiPath="/api/manga"
      title="MANGA"
      subtitle="Ta collection de manga — explore les séries populaires"
    />
  );
}
