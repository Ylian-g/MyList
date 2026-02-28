import { MediaPage } from "@/components/MediaPage";

export default function GamesPage() {
  return (
    <MediaPage
      mediaType="GAME"
      apiPath="/api/games"
      title="JEUX VIDÉO"
      subtitle="Ta collection de jeux — découvre les sorties du mois"
    />
  );
}
