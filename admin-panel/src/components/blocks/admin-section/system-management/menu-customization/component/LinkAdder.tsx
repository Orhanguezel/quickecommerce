import { Card, CardContent } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface LinkAdderProps {
  onAddLink: (title: string, url: string) => void;
}

const LinkAdder = ({ onAddLink }: LinkAdderProps) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddLink(title, url);
      setTitle("");
      setUrl("");
    }
  };

  return (
    <Card className="mt-4 ">
      <h3 className="font-medium p-4 shadow-custom">Add Custom Link</h3>
      <CardContent className="space-y-3 p-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Menu item title"
            className="app-input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">URL</label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="app-input"
          />
        </div>
        <Button onClick={handleAddLink} type="button" className="app-button">
          Add Link to Menu
        </Button>
      </CardContent>
    </Card>
  );
};

export default LinkAdder;
