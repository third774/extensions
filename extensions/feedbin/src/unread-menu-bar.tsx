import {
  Icon,
  LaunchType,
  MenuBarExtra,
  Toast,
  getPreferenceValues,
  launchCommand,
  open,
  openCommandPreferences,
  openExtensionPreferences,
  showToast,
  updateCommandMetadata,
} from "@raycast/api";
import { useEffect } from "react";
import {
  Entry,
  markAsRead,
  useEntries,
  useSubscriptionMap,
  useUnreadEntriesIds,
} from "./utils/api";

export default function MenuCommand(): JSX.Element {
  const { showCountInMenuBar } =
    getPreferenceValues<Preferences.UnreadMenuBar>();
  const entries = useEntries({ read: false, per_page: 30 });
  const subscriptionMap = useSubscriptionMap();
  const { data: unreadEntryIds } = useUnreadEntriesIds();

  useEffect(() => {
    (async () => {
      await updateCommandMetadata({
        subtitle: `${entries.data?.length.toString() ?? ""} unread items`,
      });
    })();
  }, []);

  const unreadCount = unreadEntryIds?.length ?? 0;

  const handleMarkAsRead = async (entry: Entry) => {
    try {
      showToast(Toast.Style.Animated, "Marking as read...");
      await markAsRead(entry.id);
      showToast(Toast.Style.Success, `Marked as read: ${entry.title}`);
    } catch (error) {
      showToast(Toast.Style.Failure, `Failed to mark as read: ${entry.title}`);
    }
  };

  return (
    <MenuBarExtra
      icon={{ source: "feedbin.png" }}
      title={showCountInMenuBar ? unreadCount.toString() : undefined}
      isLoading={entries.isLoading || subscriptionMap.isLoading}
    >
      <MenuBarExtra.Section>
        <MenuBarExtra.Item
          title="Manage Subscriptions"
          onAction={() =>
            launchCommand({
              name: "subscriptions",
              type: LaunchType.UserInitiated,
            })
          }
        />
        <MenuBarExtra.Item
          title="Configure Command"
          icon={Icon.Gear}
          shortcut={{ modifiers: ["cmd"], key: "," }}
          onAction={openCommandPreferences}
          alternate={
            <MenuBarExtra.Item
              title="Configure Extension"
              icon={Icon.Gear}
              onAction={openExtensionPreferences}
            />
          }
        />
      </MenuBarExtra.Section>
      <MenuBarExtra.Section>
        {unreadCount === 0 && <MenuBarExtra.Section title="No unread items" />}
        {entries.data?.map((entry) => (
          <MenuBarExtra.Item
            key={entry.id}
            title={entry.title ?? "(no title)"}
            subtitle={
              subscriptionMap.data?.[entry.feed_id]?.title ?? "Unknown Feed"
            }
            icon={Icon.Globe}
            onAction={() => open(entry.url)}
            alternate={
              <MenuBarExtra.Item
                icon={Icon.Check}
                title={"Mark as Read: " + entry.title}
                onAction={async () => {
                  await entries.mutate(handleMarkAsRead(entry));
                }}
              />
            }
          />
        ))}
      </MenuBarExtra.Section>
      <MenuBarExtra.Item
        title="View More"
        icon={Icon.List}
        onAction={() => {
          launchCommand({
            name: "all-feeds",
            type: LaunchType.UserInitiated,
          });
        }}
      />
    </MenuBarExtra>
  );
}
