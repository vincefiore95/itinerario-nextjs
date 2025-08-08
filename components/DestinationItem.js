export default function DestinationItem({ dest }) {
  const openInMaps = () => {
    const encoded = encodeURIComponent(dest.address);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      window.open(`maps://maps.apple.com/?q=${encoded}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank');
    }
  };

  return (
    <li style={{ marginBottom: '10px' }}>
      <strong>{dest.name}</strong> - {dest.address}
      <button style={{ marginLeft: '10px' }} onClick={openInMaps}>
        Apri in Mappe
      </button>
    </li>
  );
}
