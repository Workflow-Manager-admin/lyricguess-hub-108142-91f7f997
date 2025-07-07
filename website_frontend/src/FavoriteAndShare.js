import React, { useState, useEffect } from "react";

/**
 * PUBLIC_INTERFACE
 * FavoriteAndShare component:
 * - Heart icon to save/unsave recipe to favorites in localStorage (by id and name).
 * - Share icon/button to copy the recipe link, or show native share dialog if available.
 * - Colorful, inviting UI with visible feedback, suitable for a recipe card.
 *
 * @param {Object} props - expects:
 *   - recipeId: string | unique identifier for favorite
 *   - recipeName: string | shown in feedback/snackbar and share text
 *   - shareUrl: string | URL to share (defaults to window.location.href)
 *   - size: number | size for icons (optional, default 28)
 *   - style: style overrides (optional)
 */
export default function FavoriteAndShare({
  recipeId,
  recipeName,
  shareUrl,
  size = 28,
  style = {},
}) {
  const favKey = "vr-favorites";
  const [isFav, setIsFav] = useState(false);
  const [showFavAnim, setShowFavAnim] = useState(false);
  const [showMsg, setShowMsg] = useState("");
  const [showMsgType, setShowMsgType] = useState(""); // "fav" or "share"

  // On mount, check favorite state from localStorage
  useEffect(() => {
    let favs = [];
    try {
      favs = JSON.parse(localStorage.getItem(favKey)) || [];
    } catch (e) {}
    setIsFav(favs.some(f => f.id === recipeId));
  }, [recipeId]);

  // Add or remove favorite
  function toggleFavorite() {
    let favs = [];
    try {
      favs = JSON.parse(localStorage.getItem(favKey)) || [];
    } catch (e) {}
    if (isFav) {
      // Remove
      favs = favs.filter(f => f.id !== recipeId);
      setIsFav(false);
      setShowMsg("Removed from favorites");
      setShowMsgType("fav");
    } else {
      // Add
      favs.push({ id: recipeId, name: recipeName });
      setIsFav(true);
      setShowFavAnim(true);
      setShowMsg("Added to favorites!");
      setShowMsgType("fav");
      setTimeout(() => setShowFavAnim(false), 900);
    }
    localStorage.setItem(favKey, JSON.stringify(favs));
    // Auto-dismiss
    setTimeout(() => {
      setShowMsg("");
    }, 1600);
  }

  // Handle share button logic (Web Share API if possible, else fallback to copy)
  async function handleShare() {
    const url = shareUrl || window.location.href;
    const shareText = recipeName
      ? `Check out this recipe: ${recipeName}\n${url}`
      : url;

    if (navigator.share) {
      try {
        await navigator.share({
          title: recipeName || "Recipe",
          text: shareText,
          url: url,
        });
        setShowMsg("Shared successfully!");
        setShowMsgType("share");
      } catch (e) {
        setShowMsg("Sharing cancelled");
        setShowMsgType("share");
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setShowMsg("Link copied!");
        setShowMsgType("share");
      } catch (e) {
        setShowMsg("Could not copy link");
        setShowMsgType("share");
      }
    } else {
      // Fallback: select input method
      prompt("Copy and share this link:", url);
      setShowMsg("Ready to share!");
      setShowMsgType("share");
    }
    setTimeout(() => setShowMsg(""), 1600);
  }

  const heartStyle = {
    display: "inline-block",
    verticalAlign: "middle",
    transition: "transform .20s cubic-bezier(.35,2,.52,.77)",
    cursor: "pointer",
    filter: isFav ? "drop-shadow(0 1.5px 8px #ffbe85)" : "",
    transform: showFavAnim ? "scale(1.25)" : "",
    marginRight: 7,
    ...style
  };

  const shareStyle = {
    display: "inline-block",
    verticalAlign: "middle",
    transition: "transform .13s cubic-bezier(.44,1.22,.65,.86)",
    cursor: "pointer",
    marginLeft: 6,
    ...style
  };

  // Heart SVG is lively and colorful on active
  function HeartSVG({ filled }) {
    return filled ? (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <path
          d="M20 36s-12-7.5-12-17a7 7 0 0 1 13-4.1A7 7 0 0 1 32 19c0 9.5-12 17-12 17z"
          fill="#fc7e2a"
          stroke="#e45523"
          strokeWidth="2.7"
        />
        <ellipse cx="15.5" cy="19.5" rx="3.2" ry="4" fill="#fff6e0" fillOpacity="0.18"/>
        <ellipse cx="23.5" cy="15.5" rx="2.5" ry="1.8" fill="#fff" fillOpacity="0.22"/>
      </svg>
    ) : (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <path
          d="M20 36s-12-7.5-12-17a7 7 0 0 1 13-4.1A7 7 0 0 1 32 19c0 9.5-12 17-12 17z"
          fill="#fffbe3"
          stroke="#ffaf61"
          strokeWidth="2.2"
        />
      </svg>
    );
  }

  // Share SVG: uses accent/secondary theme
  function ShareSVG() {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="18.3" fill="#73f2a5" stroke="#1dd98b" strokeWidth="1.7"/>
        <path d="M27 16l-7-5-7 5" stroke="#191414" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 11v17" stroke="#191414" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    );
  }

  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 6,
        margin: "7px 0 9px 0", userSelect: "none"
      }}
    >
      <span
        style={heartStyle}
        aria-label={isFav ? "Remove favorite" : "Save as favorite"}
        title={isFav ? "Remove favorite" : "Save as favorite"}
        tabIndex={0}
        onClick={toggleFavorite}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") toggleFavorite();
        }}
      >
        <HeartSVG filled={isFav} />
      </span>
      <span
        style={shareStyle}
        aria-label="Share this recipe"
        title="Share recipe"
        tabIndex={0}
        onClick={handleShare}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") handleShare();
        }}
      >
        <ShareSVG />
      </span>
      {/* Feedback "snackbar"/message */}
      {(showMsg && (
        <span
          style={{
            marginLeft: 12,
            background: showMsgType === "fav" ? "#ffe3c3" : "#e0fff2",
            color: showMsgType === "fav" ? "#fc7e2a" : "#199861",
            borderRadius: 9,
            padding: "4px 12px",
            fontWeight: 700,
            fontSize: 15.2,
            boxShadow: "0 2px 12px #e7bb6740",
            animation: "popmsg .3s cubic-bezier(.44,2.4,.52,.8)",
            zIndex: 2
          }}
        >
          {showMsg}
          <style>
            {`
              @keyframes popmsg {
                0% { transform: scale(0.85) translateY(9px);}
                90% { transform: scale(1.07) translateY(-4px);}
                100% { transform: scale(1) translateY(0);}
              }
            `}
          </style>
        </span>
      ))}
    </div>
  );
}
