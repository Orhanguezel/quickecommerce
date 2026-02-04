import Loader from "@/components/molecules/Loader";
import { Card, CardContent } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface PagesSelectorProps {
  pages: any[];
  isPagePending: boolean;
  onAddSelected: (selectedPages: any[]) => void;
}

const DefaultPagesSelector = ({
  pages,
  isPagePending,
  onAddSelected,
}: PagesSelectorProps) => {
  const [selectedPages, setSelectedPages] = useState<number[]>([]);

  const handleCheckboxChange = (pageId: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageId)
        ? prev.filter((id) => id !== pageId)
        : [...prev, pageId]
    );
  };

  const handleAddPages = () => {
    const selectedPageObjects = pages.filter((page) =>
      selectedPages.includes(page.value)
    );
    onAddSelected(selectedPageObjects);
    setSelectedPages([]);
  };

  return (
    <Card className="mt-4">
      <h3 className="font-medium p-4 shadow-custom">Default Pages</h3>
      <CardContent className="p-4">
        {isPagePending ? (
          <div>
            <Loader customClass="my-10" size="medium" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="max-h-60 overflow-y-auto space-y-3">
              {pages.map((page) => (
                <div key={page.value} className="flex items-center">
                  <Checkbox
                    id={`default-page-${page.value}`}
                    checked={selectedPages.includes(page.value)}
                    onCheckedChange={() => handleCheckboxChange(page.value)}
                  />
                  <label
                    htmlFor={`default-page-${page.value}`}
                    className="px-2 text-sm"
                  >
                    {page.label}
                  </label>
                </div>
              ))}
            </div>
            <Button
              type="button"
              onClick={handleAddPages}
              className="mt-3 app-button"
            >
              Add Pages to Menu
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DefaultPagesSelector;
