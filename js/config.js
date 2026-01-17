// ========================================
// JAPAN 2026 TRIP PLANNER - Configuration
// ========================================

// Default placeholder images (SVG data URIs using nav icons)
const DEFAULT_DESTINATION_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%231a1a2e'/%3E%3Cg transform='translate(200,150)'%3E%3Cpath d='M0 -60c-33 0-60 27-60 60 0 47 60 87 60 87s60-40 60-87c0-33-27-60-60-60z' fill='none' stroke='%23ff5c8d' stroke-width='4'/%3E%3Ccircle cx='0' cy='0' r='20' fill='none' stroke='%23ff5c8d' stroke-width='4'/%3E%3C/g%3E%3Ctext x='200' y='260' text-anchor='middle' fill='%23666' font-family='sans-serif' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";

const DEFAULT_ACTIVITY_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%231a1a2e'/%3E%3Cg transform='translate(200,140)'%3E%3Cpolygon points='0,-50 13,-20 46,-15 22,10 28,43 0,27 -28,43 -22,10 -46,-15 -13,-20' fill='none' stroke='%23ffd93d' stroke-width='4'/%3E%3C/g%3E%3Ctext x='200' y='260' text-anchor='middle' fill='%23666' font-family='sans-serif' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";

// Supabase Configuration
// Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'https://qamzcfhtibvylshhvmoh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhbXpjZmh0aWJ2eWxzaGh2bW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNTI5NzksImV4cCI6MjA4MzcyODk3OX0.7SPBewRL1AvVuh4ANo7dzTpp7iMMYaSOpj1-BVyHXgs';

// Trip Configuration
const TRIP_CONFIG = {
    // Date range for the trip planning
    minDate: '2026-07-01',
    maxDate: '2026-08-31',
    
    // Default trip length in days
    defaultTripLength: 14,
    minTripLength: 7,
    maxTripLength: 21,
    
    // Team members
    // Add avatar_url with path to profile pictures (e.g., 'images/avatars/julian.jpg')
    teamMembers: [
        { name: 'Julian', initials: 'J', color: '#ff5c8d', avatar_url: null },
        { name: 'Dave', initials: 'D', color: '#5ce1e6', avatar_url: null },
        { name: 'Jason', initials: 'Js', color: '#b06cff', avatar_url: null },
        { name: 'Frank', initials: 'F', color: '#ff9a5c', avatar_url: null },
        { name: 'Cathy', initials: 'C', color: '#ffd93d', avatar_url: null },
        { name: 'Matylda', initials: 'M', color: '#4ade80', avatar_url: null },
        { name: 'Patryk', initials: 'P', color: '#ff8fab', avatar_url: null }
    ]
};

// City image URLs (using Unsplash for beautiful free images)
const CITY_IMAGES = {
    'Tokyo': 'https://img.static-kl.com/transform/216337e7-bfe5-4aa6-9c9e-180c3e5ac6a2/',
    'Kyoto': 'https://www.mensjournal.com/.image/w_3840,q_auto:good,c_fill,ar_16:9/MTk2MTM2NjY0Mzg4MzQ3MDI1/kyoto.jpg',
    'Osaka': 'https://images.contentstack.io/v3/assets/blt06f605a34f1194ff/bltaf46149264e88b48/6781593f1cd05fd46a4b089c/BCC-2024-EXPLORER-OSAKA-FUN-THINGS-TO-DO-IN-OSAKA-HEADER_MOBILE.jpg?fit=crop&disable=upscale&auto=webp&quality=60&crop=smart',
    'Nara': 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0b/35/6d/56/photo0jpg.jpg?w=900&h=500&s=1',
    'Hakone': 'https://images.unsplash.com/photo-1578271887552-5ac3a72752bc?w=800&q=80',
    'Nikko': 'https://ik.imgkit.net/3vlqs5axxjf/TW/ik-seo/uploadedImages/All_TW_Art/2019/0121/T0121KEGONFALLS_HR/Escape-into-nature-and-culture-in-Nikko-Japan.jpg?width=1540&height=866&mode=crop&Anchor=MiddleCenter&tr=w-780%2Ch-440%2Cfo-auto',
    'Kanazawa': 'https://japanculturalexpo.bunka.go.jp/en/article/route/202312/assets/img/main.jpg',
    'Okinawa': 'https://www.smartluxury.com/_next/image?url=https%3A%2F%2Fstweb-cdn.shermanstravel.com%2F2025-okinawa%2Fokinawa-aerial.jpg&w=1440&q=75',
    'Miyajima': 'https://www.onthegotours.com/repository/Miyajima-Highlight--Web-Ready-310971470221913.jpg',
    'Koyasan': 'https://visitwakayama.jp/lsc/upfile/courseDetail/0000/0061/61_1_l.jpg',
    'Naoshima': 'https://media.cntraveler.com/photos/62c64b9bdfd97d8fbbe8a0e8/16:9/w_2560%2Cc_limit/Hiroshi%2520Sugimoto%25E2%2580%2599s%2520Glass%2520Tea%2520House%2520Mondrian_%25C2%25A9%2520Sugimoto%2520Studio_Glass%2520tea%2520house%2520at%2520Noshima023.jpg',
    'Shirakawa-go': 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Ogi_Shirakawa-g%C5%8D%2C_Gifu%2C_Japan.jpg'
};

// Attraction image URLs
const ATTRACTION_IMAGES = {
    // Tokyo
    'Tokyo Shopping': 'https://i0.wp.com/www.touristjapan.com/wp-content/uploads/2018/08/Tokyos-Best-Shopping-Districts3.jpg?resize=800%2C450&ssl=1',
    'Shibuya Crossing': 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80',
    'Senso-ji Temple': 'https://nightscape.tokyo/en/wp-content/uploads/2023/01/asakusa-sakura-01.jpg',
    'Meiji Shrine': 'https://www.exploreshaw.com/wp-content/uploads/2016/05/IMG_9024.jpg',
    'Tsukiji Market': 'https://www.ninjafoodtours.com/wp-content/uploads/2025/06/michael-demarco-QkM2yEQcuSA-unsplash-scaled-e1750488726893.jpg',
    'Shinjuku Golden Gai': 'https://images.unsplash.com/photo-1554797589-7241bb691973?w=800&q=80',
    'teamLab Borderless': 'https://artart-uploads.s3.amazonaws.com/2018/07/pasted-image-0-25-2.webp',
    'Akihabara': 'https://animota.net/cdn/shop/articles/blog_akihabara.png?v=1757387608',
    // Kyoto
    'Fushimi Inari Shrine': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoInagK8JybmfPlTMPAw2wX3YZhXQRh2UgBQ&s',
    'Kiyomizu-dera Temple': 'https://www.toobusyto.org.uk/ctt/posts/2023/11/kyoto-kiyomizu-dera-temple-higashiyama-district/DSZ_2000%20RP.jpeg',
    'Arashiyama Bamboo Grove': 'https://japanspecialist.com/documents/d/japanspecialist/1-arashiyama-beyond-the-bamboo',
    'Gion District': 'https://www.chrisrowthorn.com/wp-content/uploads/2016/01/Gion-at-Night-Walk-4.jpg',
    'Nishiki Market': 'https://cdn-imgix.headout.com/media/images/c137d8b6f8bf01224170ed9686811528-21415-tokyo-kyoto-nishiki-market-food-tour-01.jpg?w=1041.6000000000001&h=651&crop=faces&auto=compress%2Cformat&fit=min',
    'Kinkaku-ji': 'https://res.klook.com/image/upload/q_85/c_fill,w_750/v1756171807/zdqjodrqc2h8vicnzzhr.jpg',
    'Tea Ceremony': 'https://orizuruya.net/wp-content/themes/oriduruya/assets/img/top/fv.webp',
    // Osaka
    'Dotonbori': 'https://cdn.gaijinpot.com/app/uploads/sites/4/2014/04/dotonburi.jpg',
    'Kuromon Market': 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/19/e0/90/c2/kuromon-market.jpg?w=900&h=500&s=1',
    'Universal Studios Japan': 'https://s-light.tiket.photos/t/01E25EBZS3W0FY9GTG6C42E1SE/rsfit19201280gsm/events/2025/08/27/9e1f179b-207a-47f8-bbf9-db283502e724-1756276085036-d99db84066364164c42e4897f3ae0d98.jpg',
    'Osaka Castle': 'https://res.klook.com/image/upload/fl_lossy.progressive,q_60/v1755071491/destination/rln18ze4qicniwhvxwu5.jpg',
    'Umeda': 'https://cdn2.veltra.com/ptr/20250403073915_144831255_15793_0.jpg',
    // Nara
    'Nara Deer Park': 'https://donnykimball.com/wp-content/uploads/2023/08/A-Deer-in-front-of-Todai-ji-in-Nara-Prefecture.webp',
    'Todai-ji Temple': 'https://www.nippon.com/en/ncommon/contents/guide-to-japan/2412601/2412601.jpg',
    // Miyajima
    'Itsukushima Shrine': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXrESijrHA9I7jzPIp3Y49nRRm1MejGjTLIA&s',
    'Mount Misen': 'https://images.ctfassets.net/cynoqtn1y5gl/12942_015/8497c4b941aa83fbc6d9fbd02aed5687/12942_015.jpg?fit=fill&w=918&fm=webp',
    // Hakone
    'Mount Fuji': 'https://d36tnp772eyphs.cloudfront.net/blogs/1/2018/08/Mount-Fuji.jpg',
    'Fuji Lakes': 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/15/85/46/fd.jpg',
    'Japanese Onsen Experience': 'https://www.travelandleisure.com/thmb/SXh3LhAfY9GlICz8nEiiQ-WGYVg=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/TAL-header-takaragawa-onsen-osenkaku-hot-spring-HOTSPRINGHTL1222-b74c0500acc6463d9767c8249f6437e3.jpg',
    'Hakone Open-Air Museum': 'https://upload.wikimedia.org/wikipedia/commons/9/91/Hakone5.jpg',
    'Hakone Ropeway': 'https://japanherewecome.com/wp-content/uploads/2023/11/Hakone-Jinja-Torii-Gate-Lake-Ashi-Japan.webp',
    // Kanazawa
    'Kenrokuen': 'https://cdn.audleytravel.com/2758/1967/79/1314567-kenrokuen-garden-kanazawa.jpg',
    'Kanazawa': 'https://imgcp.aacdn.jp/img-a/1200/900/global-aaj-front/article/2017/02/58aa694811751_58aa68dc207ab_257986910.jpg',
    // Shirakawa-go
    'Shirakawa-go': 'https://farm8.staticflickr.com/7793/18300466355_d8782a1c4a_c.jpg',
    // Nikko
    'Nikko Toshogu': 'https://upload.wikimedia.org/wikipedia/commons/2/26/200801_Nikko_Tosho-gu_Nikko_Japan03s3.jpg',
    // Koyasan
    'Koyasan': 'https://i.natgeofe.com/n/c2dfff24-f3a7-4fd5-96e8-352a96efad5c/Japan2.jpg',
    // Naoshima
    'Naoshima': 'https://www.neverendingvoyage.com/wp-content/uploads/2019/11/naoshima-island-5.jpg',
    // Okinawa
    'Okinawa': 'https://img.activityjapan.com/wi/okinawa_bluegrotto_whereisgood_003.jpg'
};

// Japanese names for cities
const CITY_JAPANESE = {
    'Tokyo': '東京',
    'Kyoto': '京都',
    'Osaka': '大阪',
    'Hiroshima': '広島',
    'Nara': '奈良',
    'Hakone': '箱根',
    'Nikko': '日光',
    'Kanazawa': '金沢',
    'Fukuoka': '福岡',
    'Okinawa': '沖縄'
};
