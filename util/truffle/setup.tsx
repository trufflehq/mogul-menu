import { Suspense, useMemo } from 'react'
import { useAsync } from "@ultra/react";

import { getModel } from 'https://tfl.dev/@truffle/api@0.0.1/legacy/index.js'

// FIXME: host this in @truffle/util package

// TODO: config
// const API_URL = 'http://localhost:50330'
const API_URL = 'https://mycelium.staging.bio'
const PRODUCTION_DOMAIN = 'truffle.vip'

export function TruffleSetup (props: { hostname: string }) {
  return <Suspense><AsyncTruffleSetup {...props} /></Suspense>
}

function AsyncTruffleSetup ({ hostname }: { hostname: string }) {  
  const domain = useAsync('/domain', () => getDomainByDomainName(hostname))
  useTruffleSetup({ domain })

  return <></>
}

type Domain = {
  packageVersionId: string,
  orgId: string
}
function useTruffleSetup ({ domain }: { domain?: Domain } = {}) {
  useMemo(() => {
    if (domain) {
      const siteInfo = {
        packageVersionId: domain.packageVersionId,
        orgId: domain.orgId
      }
      
      getModel().auth.setSiteInfo(siteInfo)
    }
  }, [Boolean(domain)])
}

export async function getDomainByDomainName (domainName: string) {
  if (globalThis?.Deno?.env.get('mode') === 'dev' || true) {
    domainName = `staging-dev.${PRODUCTION_DOMAIN}`
  }

  const domainResponse = await graphqlQuery({
    query: `query DomainByDomainName($domainName: String) {
      domain(domainName: $domainName) {
        orgId
        packageVersionId
        org { slug }
      }
    }`,
    variables: { domainName }
  })
  const domain = domainResponse?.data?.domain  

  if (!domain) {
    throw new Error('Invalid page')
  }

  return domain || null
}

async function graphqlQuery ({ query, variables, orgId, accessToken }: { query: string, variables?: Record<string, unknown>, orgId?: string, accessToken?: string}) {
  const response = await fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      'X-Access-Token': accessToken || '',
      'X-Org-Id': orgId || ''
    }, // Avoid CORS preflight
    body: JSON.stringify({ query, variables })
  })

  return response.json()
}
