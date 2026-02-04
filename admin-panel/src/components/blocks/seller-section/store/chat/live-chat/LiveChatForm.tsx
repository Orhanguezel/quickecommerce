"use client";
import { useLiveChatQuery } from "@/modules/seller-section/chat/chat.action";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Chat from "./components/Chat";
import { useAppSelector } from "@/redux/hooks";

const LiveChatForm = () => {
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const selectedStore = useAppSelector((state) => state.store.selectedStore);
  const storeID = selectedStore?.id;
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [liveChatUserList, setLiveChatUserList] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const { LiveChatList, refetch, isPending, isFetching, error } =
    useLiveChatQuery({
      language: locale,
      store_id: storeID,
      search: searchQuery,
      type: selectedType,
      page: currentPage,
    });
  const LastPage = (LiveChatList as any)?.meta?.last_page;
  const newData = useMemo(
    () => (LiveChatList as any)?.data || [],
    [LiveChatList]
  );
  useEffect(() => {
    setLiveChatUserList([]);
    setCurrentPage(1);
    setLoading(true);
    refetch();
  }, [refetch, selectedType, searchQuery]);

  useEffect(() => {
    if (currentPage > 1) {
      setLoading(true);
      refetch();
    }
  }, [currentPage, refetch]);

  const handleLoadMore = () => {
    if (nextUrl) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const currentPageFromMeta = (LiveChatList as any)?.meta?.current_page;
  useEffect(() => {
    if (newData.length) {
      setLiveChatUserList((prev) => {
        const updatedList = [...prev, ...newData];

        const uniqueWishlist = Array.from(
          new Map(updatedList.map((item) => [item.chat_id, item])).values()
        );

        return uniqueWishlist;
      });
      setNextUrl(currentPageFromMeta || null);
    }
    setLoading(false);
    setHasMore(currentPage < LastPage);
  }, [newData, currentPage, LiveChatList, currentPageFromMeta, LastPage]);

  return (
    <div>
      <Chat
        searchQuery={searchQuery}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        setSearchQuery={setSearchQuery}
        originalData={liveChatUserList}
        handleLoadMore={handleLoadMore}
        hasMore={hasMore}
        isListLoading={isFetching}
      />
    </div>
  );
};

export default LiveChatForm;
