import { ActionPanel, Icon, List } from "@raycast/api";
import { useState } from "react";
import { useFeedbinApiContext } from "../utils/FeedbinApiContext";
import { Entry } from "../utils/api";
import { getIcon } from "../utils/getIcon";
import { isPagesSubscription } from "../utils/isPagesSubscription";
import { ActionAiSummary } from "./ActionAiSummary";
import { ActionCopyUrlToClipboard } from "./ActionCopyUrlToClipboard";
import { ActionDebugJson } from "./ActionDebugJson";
import { ActionMarkAsRead } from "./ActionMarkAsRead";
import { ActionOpenEntryAndMarkAsRead } from "./ActionOpenEntryAndMarkAsRead";
import { ActionOpenInBrowser } from "./ActionOpenInBrowser";
import { ActionShowEntry } from "./ActionShowEntry";
import { ActionStarToggle } from "./ActionStarToggle";
import { ActionUnsubscribe } from "./ActionUnsubscribe";
import { ActionViewSubscription } from "./ActionViewSubscription";

export interface EntryListProps {
  navigationTitle?: string;
}

export function EntryList(props: EntryListProps) {
  const {
    isLoading,
    entries: allEntries,
    unreadEntries,
    filterFeedId,
    setFilterFeedId,
    subscriptions,
    unreadEntriesIds,
  } = useFeedbinApiContext();

  const [showUnread, setShowUnread] = useState(false);
  const entries = showUnread ? unreadEntries : allEntries;
  const readLaterSubscription = subscriptions.data?.find((sub) =>
    isPagesSubscription(sub),
  );

  return (
    <List
      pagination={entries.pagination}
      navigationTitle={
        props.navigationTitle ??
        `View Feeds (${unreadEntriesIds.data?.length.toString()} unread)`
      }
      searchBarAccessory={
        props.navigationTitle ? undefined : (
          <List.Dropdown
            defaultValue={filterFeedId?.toString() ?? "all"}
            tooltip="Option to prioritize unread entries"
            onChange={(value) => {
              if (value === "unread") {
                setFilterFeedId(undefined);
                setShowUnread(true);
              } else {
                setFilterFeedId(value === "all" ? undefined : Number(value));
                setShowUnread(false);
              }
            }}
          >
            <List.Dropdown.Section>
              <List.Dropdown.Item title={"All feeds"} value={"all"} />
              <List.Dropdown.Item title={"Unread"} value={"unread"} />
              {readLaterSubscription && (
                <List.Dropdown.Item
                  title={"Read Later"}
                  value={readLaterSubscription?.feed_id.toString()}
                />
              )}
            </List.Dropdown.Section>
            <List.Dropdown.Section title="Feeds">
              {subscriptions.data?.map((subscription) => {
                if (isPagesSubscription(subscription)) return null;
                return (
                  <List.Dropdown.Item
                    key={subscription.id}
                    title={subscription.title}
                    keywords={[subscription.title, subscription.site_url]}
                    value={subscription.feed_id.toString()}
                  />
                );
              })}
            </List.Dropdown.Section>
          </List.Dropdown>
        )
      }
      isLoading={isLoading}
    >
      {entries.data && entries.data.length === 0 && (
        <List.EmptyView icon={Icon.CheckRosette} title="No content!" />
      )}

      {entries.data?.map((entry) => <ListItem key={entry.id} entry={entry} />)}
    </List>
  );
}

function ListItem(props: { entry: Entry; isUnread?: boolean }) {
  const { subscriptionMap, starredEntriesIdsSet, unreadEntriesSet } =
    useFeedbinApiContext();
  const { entry } = props;
  return (
    <List.Item
      key={entry.id}
      title={entry.title ?? entry.summary}
      icon={getIcon(entry.url)}
      keywords={(subscriptionMap[entry.feed_id]?.title ?? entry.url).split(" ")}
      subtitle={subscriptionMap[entry.feed_id]?.title ?? entry.url}
      accessories={[
        starredEntriesIdsSet.has(entry.id) && {
          icon: Icon.Star,
        },
        (unreadEntriesSet.has(entry.id) || props.isUnread) && {
          icon: Icon.Tray,
        },
      ].filter(Boolean)}
      actions={
        <ActionPanel>
          <ActionShowEntry entry={entry} />
          <ActionAiSummary entry={entry} />
          <ActionOpenInBrowser url={entry.url} />
          <ActionCopyUrlToClipboard url={entry.url} />
          <ActionViewSubscription
            feedName={subscriptionMap[entry.feed_id]?.title}
            entry={entry}
          />
          <ActionStarToggle id={entry.id} />
          <ActionMarkAsRead id={entry.id} />
          <ActionOpenEntryAndMarkAsRead entry={entry} />
          <ActionUnsubscribe feedId={entry.feed_id} />
          <ActionDebugJson data={entry} />
        </ActionPanel>
      }
    />
  );
}
