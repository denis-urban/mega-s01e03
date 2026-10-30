<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import followUps from '#lib/data/split-4471.json';
  import { groupByProblem, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  let { ticket }: { ticket: number } = $props();

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const groups = $derived(groupByProblem(merged, tenantOf, notes.oneDayMove));
  const total = $derived(groups.reduce((n, g) => n + g.reports.length, 0));
  const issue = (cause: string): string | null => (followUps as Record<string, string | null>)[cause] ?? null;
  const issueLabel = (url: string) => {
    const n = url.match(/\/issues\/(\d+)/)?.[1];
    return n ? `#${n}` : url;
  };
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{groups.length}</strong>
  {groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>follow-up</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.cause)}
      {@const url = issue(g.cause)}
      <tr>
        <td><code>{g.cause}</code></td>
        <td class="n">{g.reports.length}</td>
        <td>
          {g.tenants}
          <span class="handles">{g.tenantHandles.join(', ')}</span>
        </td>
        <td class="seen">{g.firstSeen} → {g.lastSeen}</td>
        <td>
          {#if url}<a href={url}>{issueLabel(url)}</a>{:else}<span class="pending">ticket pending</span>{/if}
        </td>
      </tr>
    {/each}
  </tbody>
  <tfoot>
    <tr>
      <th>total</th>
      <th class="n">{total}</th>
      <th colspan="3" class:off={total !== merged.length}>
        {total === merged.length ? `adds up to the ${merged.length} merged` : `does not add up: ${merged.length} merged`}
      </th>
    </tr>
  </tfoot>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .n { font-variant-numeric: tabular-nums; }
  .handles { display: block; color: var(--muted); font-size: 0.8em; line-height: 1.35; }
  .seen { white-space: nowrap; }
  .pending { color: var(--warn); font-weight: 600; white-space: nowrap; }
  tfoot th { font-weight: 600; }
  tfoot th:last-child { color: var(--muted); font-weight: 400; }
  tfoot th.off { color: var(--warn); font-weight: 600; }
</style>
