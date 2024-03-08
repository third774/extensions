import { MenuBarExtra } from "@raycast/api";

import { getJiraCredentials } from "./api/jiraCredentials";
import { withJiraCredentials } from "./helpers/withJiraCredentials";
import useIssues from "./hooks/useIssues";

function OpenIssuesMenuBar() {
  const { issues, isLoading } = useIssues("assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC");

  return (
    <MenuBarExtra
      isLoading={isLoading}
      icon={{
        source: "icon.png",
      }}
    >
      {issues?.map((issue) => (
        <MenuBarExtra.Item
          key={issue.id}
          title={issue.fields.summary}
          onAction={() => {
            const { siteUrl } = getJiraCredentials();
            open(`${siteUrl}/browse/${issue.key}`);
          }}
        ></MenuBarExtra.Item>
      ))}
    </MenuBarExtra>
  );
}

export default withJiraCredentials(OpenIssuesMenuBar);
