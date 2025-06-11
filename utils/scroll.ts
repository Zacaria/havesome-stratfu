export const scrollToAnchor = (anchorId: string, offset = 80) => {
  // Wait for the next tick to ensure the page has rendered
  setTimeout(() => {
    const element = document.getElementById(anchorId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, 0);
};
