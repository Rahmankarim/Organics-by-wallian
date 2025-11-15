(async () => {
  try {
    const res = await fetch("http://localhost:3002/api/products");
    if (!res.ok) {
      console.error("Status", res.status);
      process.exit(1);
    }
    const data = await res.json();
    const p = (data.products || [])[0];
    console.log(
      JSON.stringify(
        {
          id: p?.id,
          _id: p?._id,
          name: p?.name,
          images: (p?.images || []).slice(0, 3),
          reviewCount: p?.reviewCount,
          reviews: p?.reviews,
        },
        null,
        2
      )
    );
  } catch (err) {
    console.error("Fetch error", err);
    process.exit(1);
  }
})();
