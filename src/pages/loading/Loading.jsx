import React from "react";

const Loading = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent/20 border-t-accent" />
        <p className="font-display font-medium text-muted-foreground animate-pulse">
          Securely connecting...
        </p>
      </div>
    </div>
  );
};

export default Loading;
