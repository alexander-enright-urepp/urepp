// Generate placeholder params - actual data fetched client-side in Capacitor app
export async function generateStaticParams() {
  return [
    { username: 'sample-player' },
  ];
}
