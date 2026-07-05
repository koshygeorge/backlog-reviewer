// Digital Asset Lifecycle Management (DALM) Program Reference Data

export const okrs = {
  "OKR-1": {
    id: "OKR-1",
    objective: "Maximize the business value and ROI of digital assets across their full lifecycle",
    keyResults: [
      "KR1: Reduce time-to-market for new digital assets by 40% within 12 months",
      "KR2: Achieve 95% asset utilization rate across all business units by Q3",
      "KR3: Reduce asset duplication costs by 30% through centralized asset governance",
      "KR4: Attain a Digital Asset Management (DAM) adoption rate of 85% company-wide"
    ]
  },
  "OKR-2": {
    id: "OKR-2",
    objective: "Ensure compliance, security, and governance of all digital assets",
    keyResults: [
      "KR1: Achieve 100% license compliance across all managed digital assets",
      "KR2: Reduce unauthorized asset usage incidents by 90% within 6 months",
      "KR3: Maintain an audit-ready state with 100% metadata completeness on critical assets",
      "KR4: Reduce security breach incidents related to digital assets by 75%"
    ]
  },
  "OKR-3": {
    id: "OKR-3",
    objective: "Streamline asset workflows and collaboration to accelerate creative output",
    keyResults: [
      "KR1: Reduce asset review and approval cycle time by 50% within 9 months",
      "KR2: Increase cross-team asset reuse rate to 60% of total assets consumed",
      "KR3: Achieve a user satisfaction score (CSAT) of 4.5/5 for the DAM platform",
      "KR4: Reduce manual asset processing tasks by 70% through automation"
    ]
  }
};

export const epics = {
  "E-01": {
    id: "E-01",
    title: "Asset Ingestion & Centralized Repository",
    linkedOkrs: ["OKR-1"],
    description: "Establish a single, authoritative repository for all digital assets — images, video, documents, audio, and design files — with automated ingestion pipelines. This epic delivers a 'single source of truth' that eliminates content silos, slashes duplicate storage costs, and provides the foundational layer upon which all downstream lifecycle capabilities are built.",
    kpis: [
      { name: "Asset ingestion cycle time", target: "< 2 hrs from upload to searchable", measurement: "Avg. hours from upload event to indexed status in DAM" },
      { name: "Duplicate asset rate", target: "< 5% of total asset library", measurement: "% duplicate files detected by deduplication engine monthly" },
      { name: "Repository adoption rate", target: "85% of creative teams onboarded", measurement: "% active users / total licensed users per quarter" },
      { name: "Storage cost per asset", target: "20% reduction YoY", measurement: "Total storage cost / total managed assets" }
    ],
    features: {
      "F-01.1": "Multi-Source Automated Ingestion Pipeline",
      "F-01.2": "AI-Powered Auto-Tagging & Metadata Enrichment"
    }
  },
  "E-02": {
    id: "E-02",
    title: "Asset Governance, Compliance & Rights Management",
    linkedOkrs: ["OKR-2"],
    description: "Implement comprehensive governance controls covering license management, usage rights, expiry enforcement, and role-based access control. This epic protects the organisation from legal and financial penalties associated with unlicensed asset use, ensures GDPR/IP compliance, and maintains an immutable audit trail for all asset interactions.",
    kpis: [
      { name: "License compliance rate", target: "100%", measurement: "% assets with valid, documented license vs total managed assets" },
      { name: "Unauthorised usage incidents", target: "90% reduction in 6 months", measurement: "Count of policy violation alerts triggered per month" },
      { name: "Metadata completeness (critical assets)", target: "100%", measurement: "% critical assets with all mandatory metadata fields populated" },
      { name: "Mean time to detect breach", target: "< 1 hour", measurement: "Avg. time from policy violation event to alert generation" }
    ],
    features: {
      "F-02.1": "Digital Rights & License Management",
      "F-02.2": "Audit Trail & Compliance Reporting"
    }
  },
  "E-03": {
    id: "E-03",
    title: "Approval Workflow & Collaboration Engine",
    linkedOkrs: ["OKR-3"],
    description: "Digitise and automate the end-to-end asset review and approval workflow, replacing email chains and shared drives with a structured, trackable process. Integrates with Slack, Teams, and Jira for contextual notifications. This epic eliminates bottlenecks in creative production, provides full visibility on asset status, and reduces approval cycle time by 50% — directly accelerating campaign go-live timelines and improving stakeholder satisfaction.",
    kpis: [
      { name: "Approval cycle time", target: "50% reduction vs baseline", measurement: "Avg. days from 'Submitted for Review' to 'Approved' status per asset" },
      { name: "Workflow SLA breach rate", target: "< 5%", measurement: "% review tasks not completed within defined SLA window (e.g. 48 hrs)" },
      { name: "Reviewer utilisation", target: "Balanced: no reviewer > 120% capacity", measurement: "Count of open review tasks per reviewer at any given time" },
      { name: "CSAT for DAM platform", target: "4.5 / 5.0", measurement: "Quarterly in-app user satisfaction survey score from creative and marketing teams" }
    ],
    features: {
      "F-03.1": "Configurable Multi-Stage Approval Workflows",
      "F-03.2": "Real-Time Notifications & Collaboration Integrations"
    }
  },
  "E-04": {
    id: "E-04",
    title: "Asset Distribution, Publishing & Portal Management",
    linkedOkrs: ["OKR-1"],
    description: "Provide controlled, self-service distribution of approved assets to internal teams, external agencies, and third-party platforms via branded asset portals and API integrations. Dynamic rendition generation ensures the right asset format is always available on demand. Business outcome: marketing teams and agencies access approved, on-brand assets instantly — reducing time-to-market and eliminating the use of outdated or off-brand materials.",
    kpis: [
      { name: "Time-to-market for asset delivery", target: "40% reduction", measurement: "Avg. hours from asset approved to published/shared with downstream consumer" },
      { name: "Asset reuse rate", target: "60% of assets consumed are reused", measurement: "% asset downloads referencing an existing DAM asset vs new asset creation" },
      { name: "Self-service fulfilment rate", target: "80%", measurement: "% asset requests fulfilled without DAM team manual intervention" },
      { name: "Brand asset compliance", target: "98%", measurement: "% assets in market verified as current approved version from DAM" }
    ],
    features: {
      "F-04.1": "Branded External Asset Portals",
      "F-04.2": "Dynamic Rendition & Format Conversion Engine"
    }
  },
  "E-05": {
    id: "E-05",
    title: "Asset Retirement, Archival & Lifecycle Analytics",
    linkedOkrs: ["OKR-1", "OKR-2"],
    description: "Govern the end-of-life stage of assets through policy-driven archival and secure deletion workflows, ensuring regulatory compliance with data retention laws. Pair with a powerful analytics dashboard that surfaces asset utilisation, ROI, and lifecycle health metrics. Business outcome: proactively retire cost-generating assets, evidence compliance with retention policies, and provide leadership with the data to make informed investment decisions on content strategy.",
    kpis: [
      { name: "Archived/retired assets in compliance with retention policy", target: "100%", measurement: "% assets past retention threshold archived or deleted per policy within 30 days" },
      { name: "Storage cost savings from retirement", target: "15% YoY reduction", measurement: "Storage cost delta before/after retirement workflow automation" },
      { name: "Asset ROI visibility", target: "100% of high-value assets tracked", measurement: "% tier-1 assets with utilisation and downstream business impact recorded in analytics" },
      { name: "Lifecycle policy violation rate", target: "0 undetected violations", measurement: "Count of assets past retention date NOT yet actioned (detected via scheduled audit)" }
    ],
    features: {
      "F-05.1": "Policy-Driven Archival & Secure Deletion",
      "F-05.2": "Lifecycle Analytics & ROI Dashboard"
    }
  }
};

export const exampleStories = [
  {
    id: "US-01.1.1",
    title: "Cloud Storage Connector",
    epicId: "E-01",
    featureId: "F-01.1",
    priority: "High",
    storyPoints: 8,
    asA: "Digital Asset Manager",
    iWantTo: "connect the DAM platform to our existing S3 and Google Drive storage buckets",
    soThat: "existing assets are automatically ingested without manual re-upload, saving hundreds of hours of migration effort",
    acceptanceCriteria: `Scenario: Successful cloud storage connection
Given I am logged in as a DAM Administrator
When I navigate to Settings > Integrations > Cloud Storage
And I provide valid OAuth2 credentials for an S3 bucket
Then the system validates the connection within 30 seconds
And displays a success confirmation with the bucket name and estimated asset count

Scenario: Assets automatically ingested on schedule
Given a cloud storage connector is active and configured for hourly sync
When new files are added to the connected S3 bucket
Then those files appear as "Pending Review" assets in the DAM within 60 minutes
And each asset retains its original folder path as metadata
And a system notification is sent to the assigned asset reviewer

Scenario: Duplicate detection during ingestion
Given an asset with an identical checksum already exists in the DAM
When the ingestion pipeline processes a new file with the same checksum
Then the new file is flagged as a duplicate
And the pipeline does NOT create a new asset record
And the duplicate event is logged in the audit trail`,
    nfrs: "Performance SLA: connection validated in 30s. Performance SLA: ingestion within 60 mins. Security: OAuth2 authentication. Audit: duplicate event logged."
  },
  {
    id: "US-02.1.1",
    title: "License Attachment & Expiry Tracking",
    epicId: "E-02",
    featureId: "F-02.1",
    priority: "Critical",
    storyPoints: 8,
    asA: "Legal & Compliance Officer",
    iWantTo: "attach a structured license agreement with start and expiry dates to any digital asset",
    soThat: "the organisation always knows the usage rights of each asset and I receive automated alerts before licenses expire",
    acceptanceCriteria: `Scenario: License successfully attached to an asset
Given I am viewing an asset detail page with the "Manage Rights" permission
When I navigate to the Rights & License tab
And I upload a license document and set Start Date, Expiry Date, and Permitted Uses
Then the license record is saved and linked to the asset
And the asset is tagged with the license type (e.g., "RF", "RM", "Editorial Only")
And the change is recorded in the asset audit log with my user ID and timestamp

Scenario: Automated expiry alert sent 30 days before expiry
Given an asset has an active license expiring in 30 days
When the nightly license expiry check job runs
Then an email alert is sent to the asset owner and Legal team
And the asset is flagged with a "License Expiring Soon" visual indicator in search results

Scenario: Asset access restricted upon license expiry
Given an asset license expiry date has passed
When any non-admin user attempts to download the asset
Then the download is blocked
And the user sees a message: "This asset is currently unavailable due to license restrictions. Contact the DAM team."
And the attempted download is logged as a blocked access event`,
    nfrs: "Security/RBAC: access restricted upon expiry, only admins can bypass. Audit: download attempts logged, license changes logged. Compliance: warning indicator in search."
  },
  {
    id: "US-03.1.2",
    title: "Inline Annotation & Contextual Commenting",
    epicId: "E-03",
    featureId: "F-03.2",
    priority: "High",
    storyPoints: 8,
    asA: "Brand Manager (Reviewer)",
    iWantTo: "leave annotated feedback directly on the asset canvas (pinned comments, highlighted regions) without downloading the file",
    soThat: "my revision requests are unambiguous and actionable for the designer, reducing back-and-forth email clarification",
    acceptanceCriteria: `Scenario: Reviewer adds a pinned annotation on an image asset
Given an image asset is in "Pending Review" status and I am the assigned reviewer
When I open the asset preview and click on a specific region of the image
Then a comment pin is created at that coordinate
And I can type a comment (up to 1000 characters) linked to that pin
And I can @mention another team member in the comment
And the asset submitter receives a notification with a direct link to the annotated view

Scenario: Designer resolves a comment
Given a comment thread exists on my submitted asset
When I have addressed the feedback and re-uploaded a revised asset version
Then I can mark the specific comment thread as "Resolved"
And the comment remains visible in the history with a "Resolved" badge
And the reviewer receives a notification that the comment has been addressed`,
    nfrs: "Usability: inline preview and pinning. Performance: pin loads in real-time. Data size: comments capped at 1000 characters."
  },
  {
    id: "US-BAD-01",
    title: "File Uploading Feature",
    epicId: "E-01",
    featureId: "F-01.1",
    priority: "Medium",
    storyPoints: 13,
    asA: "User",
    iWantTo: "upload files to the platform and also share them and download them and delete them",
    soThat: "I can store them and collaborate.",
    acceptanceCriteria: `Just make sure we can drag and drop files.
It should support big files too.
And send email notifications when it's done.`,
    nfrs: ""
  }
];
