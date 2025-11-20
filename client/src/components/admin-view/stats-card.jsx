import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function StatsCard({ title, value }) {
  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

export default StatsCard;
