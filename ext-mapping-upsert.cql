# ludwig prod
INSERT INTO "spore"."embeds_by_id" (
  "id", "sourceType", "sourceId", "orgId", 
  "componentInstanceId",
  "defaultLayoutConfigSteps", 
  "maxExtensionVersion", 
  "minExtensionVersion",
  "slug", "status", "data"
) 
VALUES 
  (
    06248540-1cd2-11ed-8713-8d10b2748059, 'youtubeLive', 
    'UCrPseYLGpNygVi34QpGNqpA', 8e35b570-6c2f-11ec-bade-b32a8d305590, 3c263440-1cd2-11ed-8713-8d10b2748059, 
    '[{"action":"querySelector","value":"body"},{"action":"appendSubject","value":null}]', 
    NULL, '3.3.0', 'ea-mogul-menu', 
    'experimental', '{"iframeUrl": "https://new.ludwig.social/mogul-menu"}'
  );

# ludwig channel-points prod
INSERT INTO "spore"."embeds_by_id" (
  "id", "sourceType", "sourceId", "orgId", 
  "componentInstanceId",
  "defaultLayoutConfigSteps",
  "maxExtensionVersion", 
  "minExtensionVersion",
  "slug", "status", "data"
) 
VALUES 
  (
    ba0dc230-2897-11ed-b4d3-09601920a412, 'youtubeLive', 
    'UCrPseYLGpNygVi34QpGNqpA', 8e35b570-6c2f-11ec-bade-b32a8d305590, da5a7f10-2897-11ed-b4d3-09601920a412, 
    '[{"action": "querySelector","value": "#chatframe"},{"action": "getIframeDocument"},{"action": "querySelector","value": "#picker-buttons"},{"action": "appendSubject"}]', 
    NULL, '3.3.0', 'channel-points', 
    'experimental', '{"iframeUrl": "https://new.ludwig.social/channel-points" }'
  );
