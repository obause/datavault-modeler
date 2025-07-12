import { clsx } from 'clsx';
import type { SVGAttributes } from 'react';

export type IconName = 
  | 'plus' 
  | 'x' 
  | 'save' 
  | 'folder-open' 
  | 'folder'
  | 'file' 
  | 'trash'
  | 'archive'
  | 'settings'
  | 'external-link'
  | 'download'
  | 'upload'
  | 'refresh'
  | 'search'
  | 'hub'
  | 'link'
  | 'satellite'
  | 'pit'
  | 'bridge'
  | 'edit'
  | 'close'
  | 'info'
  | 'mail';

interface IconProps extends SVGAttributes<SVGElement> {
  name: IconName;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const Icon = ({ name, size = 'md', className, ...props }: IconProps) => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };
  
  const icons = {
    hub: (
      <svg fill="currentColor" viewBox="0 0 484 539" stroke="none">
        <g transform="translate(0.000000,539.000000) scale(0.100000,-0.100000)">
          <path d="M2180 4967 c-121 -14 -265 -39 -358 -63 -92 -23 -301 -93 -338 -112 -10 -5 -71 -35 -134 -65 -95 -46 -293 -165 -343 -207 -6 -5 -53 -44 -104 -85 -450 -366 -754 -907 -840 -1490 -21 -145 -24 -516 -5 -640 38 -241 103 -470 179 -635 19 -41 46 -99 60 -128 48 -106 175 -305 252 -398 14 -17 35 -42 45 -54 10 -13 45 -52 78 -87 379 -408 861 -657 1433 -741 64 -9 534 -9 600 0 183 26 288 50 470 110 233 77 512 230 715 393 206 165 438 430 548 626 108 193 184 361 226 499 30 100 72 276 82 340 3 25 8 56 10 70 3 14 7 126 11 250 4 180 2 253 -11 359 -74 575 -348 1090 -792 1485 -102 91 -289 221 -409 286 -44 23 -93 50 -110 60 -16 9 -73 34 -125 55 -52 20 -102 40 -110 44 -73 37 -415 114 -555 126 -117 10 -400 11 -475 2z m296 -430 c22 -23 114 -142 206 -262 92 -121 196 -258 232 -304 73 -94 89 -137 60 -158 -14 -10 -127 -13 -565 -13 -301 0 -554 3 -563 6 -48 19 -6 85 310 489 30 39 81 104 112 145 75 99 118 140 146 140 15 0 38 -16 62 -43z m100 -1158 c169 -31 372 -166 474 -315 109 -158 164 -366 141 -536 -41 -305 -229 -546 -506 -651 -106 -41 -175 -50 -325 -44 -127 4 -140 7 -228 42 -198 80 -330 197 -427 380 -100 189 -106 480 -14 681 64 140 179 269 309 344 77 45 177 86 245 100 60 12 263 12 331 -1z m-1358 -770 c-2 -404 -6 -561 -15 -570 -23 -23 -71 4 -238 132 -93 72 -181 141 -195 153 -14 12 -72 57 -130 101 -204 155 -218 170 -195 215 7 14 55 57 107 95 51 39 95 73 98 76 3 3 40 31 82 62 72 53 102 76 132 102 6 6 38 30 71 54 33 25 62 48 65 51 14 18 129 96 155 106 24 9 33 9 48 -4 16 -15 17 -50 15 -573z m2492 546 c19 -14 80 -59 136 -102 381 -294 515 -401 526 -421 20 -38 -4 -66 -169 -191 -83 -64 -196 -150 -250 -192 -276 -213 -285 -219 -314 -219 -18 0 -32 7 -39 19 -15 30 -14 1064 2 1108 11 31 15 33 43 27 16 -3 46 -16 65 -29z m-725 -1754 c12 -38 -12 -73 -325 -471 -25 -32 -74 -95 -109 -141 -36 -45 -82 -100 -103 -121 -37 -37 -38 -37 -65 -21 -15 8 -54 50 -86 92 -69 90 -148 193 -187 241 -99 123 -290 387 -290 402 0 9 8 22 18 27 11 7 216 10 579 11 540 0 562 -1 568 -19z"/>
        </g>
      </svg>
    ),
    link: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
      </svg>
    ),
    satellite: (
      <svg fill="currentColor" viewBox="0 0 352 387" stroke="none">
        <g transform="translate(0.000000,387.000000) scale(0.100000,-0.100000)">
          <path d="M2439 3135 c-288 -289 -528 -534 -533 -545 -5 -10 -6 -29 -3 -42 4 -13 80 -96 170 -185 137 -137 168 -163 193 -163 25 0 99 70 562 533 361 361 532 539 532 553 0 32 -46 87 -197 237 -117 114 -145 137 -170 137 -26 0 -95 -65 -554 -525z"/>
          <path d="M1180 2555 l-285 -285 424 -424 424 -424 -40 -79 c-111 -212 -163 -464 -163 -780 0 -118 3 -153 16 -171 37 -53 43 -47 464 373 l395 394 251 -249 c139 -138 262 -254 275 -259 34 -12 73 5 114 50 62 69 66 63 -227 350 l-263 257 398 399 c356 358 397 402 397 430 0 53 -22 58 -215 56 -310 -3 -535 -52 -753 -162 l-77 -40 -425 425 -425 424 -285 -285z"/>
          <path d="M612 1307 c-288 -287 -528 -530 -533 -539 -5 -10 -7 -28 -4 -41 4 -13 80 -97 169 -186 147 -145 166 -161 197 -161 32 0 69 35 561 528 290 290 528 534 529 542 8 39 -21 76 -171 223 -141 138 -164 157 -192 157 -30 0 -81 -48 -556 -523z"/>
        </g>
      </svg>
    ),
    pit: (
      <svg fill="currentColor" viewBox="0 0 512 512" stroke="none">
        <g transform="translate(0,512) scale(0.1,-0.1)">
          <path d="M2230 5104 c-463 -63 -909 -256 -1275 -551 -126 -101 -338 -320 -431 -444 -283 -376 -448 -780 -510 -1249 -23 -179 -15 -546 16 -719 30 -172 80 -347 144 -508 30 -76 54 -138 53 -139 -212 -113 -220 -120 -225 -207 -4 -82 10 -104 131 -195 256 -193 458 -286 737 -338 198 -37 267 -40 308 -15 43 28 72 77 72 124 0 21 -36 150 -79 285 -44 136 -100 316 -125 400 -25 85 -54 167 -63 183 -34 57 -125 82 -194 54 -13 -5 -23 13 -51 87 -91 237 -118 375 -125 633 -6 218 5 327 52 515 135 541 499 1004 996 1269 439 233 954 286 1435 147 675 -195 1215 -768 1369 -1453 47 -211 59 -498 29 -702 -111 -757 -644 -1372 -1384 -1594 -149 -45 -271 -66 -453 -77 -242 -15 -247 -22 -247 -311 0 -224 3 -239 66 -280 59 -39 375 -20 639 37 742 160 1389 663 1735 1349 189 372 270 718 270 1145 0 392 -68 710 -227 1065 -74 164 -211 388 -331 540 -80 100 -261 284 -372 377 -372 313 -868 525 -1355 578 -129 14 -481 10 -605 -6z"/>
          <path d="M2275 4201 c-676 -121 -1199 -625 -1344 -1295 -53 -244 -43 -547 25 -781 14 -48 17 -51 82 -80 84 -37 178 -127 214 -205 14 -30 54 -151 89 -269 l63 -214 76 -64 c206 -177 461 -301 747 -365 134 -30 510 -33 643 -5 342 72 608 211 849 442 244 234 398 513 472 853 30 139 37 435 15 590 -52 354 -213 671 -470 928 -255 255 -573 417 -919 468 -144 22 -411 20 -542 -3z m357 -628 c16 -10 39 -34 51 -53 22 -34 22 -43 25 -475 l3 -440 283 -285 c156 -157 289 -295 295 -307 31 -60 1 -157 -58 -188 -38 -19 -103 -19 -139 -1 -48 26 -660 648 -669 681 -4 17 -8 244 -8 505 0 466 0 476 21 508 44 69 130 93 196 55z"/>
        </g>
      </svg>
    ),
    bridge: (
      <svg fill="currentColor" viewBox="0 0 196 111">
        <path d="m16,96V9h164V96h-20q 1-72-62-68-63-4-62,68"/>
      </svg>
    ),
    save: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
      </svg>
    ),
    'folder-open': (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"/>
      </svg>
    ),
    file: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
    ),
    trash: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
      </svg>
    ),
    archive: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
      </svg>
    ),
    settings: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
    'external-link': (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
      </svg>
    ),
    download: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
      </svg>
    ),
    upload: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
      </svg>
    ),
    refresh: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
      </svg>
    ),
    search: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
    ),
    edit: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
      </svg>
    ),
    plus: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
      </svg>
    ),
    x: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
      </svg>
    ),
    folder: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2h-5.5L10 5H6c-1.1 0-2 .9-2 2z"/>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6"/>
        <circle cx="7" cy="11" r="1" fill="currentColor"/>
        <circle cx="17" cy="11" r="1" fill="currentColor"/>
        <circle cx="12" cy="15" r="1" fill="currentColor"/>
      </svg>
    ),
    close: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
      </svg>
    ),
    info: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    mail: (
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
    ),
  };
  
  // For custom icons (hub, satellite), we need to render them directly
  if (name === 'hub' || name === 'satellite') {
    return (
      <div className={clsx(sizes[size], className)}>
        {icons[name]}
      </div>
    );
  }

  // For standard icons, use the default SVG wrapper
  return (
    <svg
      className={clsx(sizes[size], className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      {...props}
    >
      {icons[name]}
    </svg>
  );
};

export default Icon; 