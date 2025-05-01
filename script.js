// Restaurant data and functions
let restaurants = [];

// Load from localStorage
function loadRestaurants() {
    const saved = localStorage.getItem('restaurants');
    if (saved) {
        restaurants = JSON.parse(saved);
    } else {
        // Default restaurants
        restaurants = [
            {
                id: 1,
                name: "Pasta Palace",
                cuisine: "italian",
                rating: 4.2,
                reviews: [
                    {
                        author: "Sarah M.",
                        rating: 5,
                        comment: "The carbonara is to die for!",
                        date: "2023-05-15"
                    }
                ],
                image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb",
                location: "123 Main St",
                priceRange: "$$$"
            }
        ];
        saveRestaurants();
    }
}

// Save to localStorage
function saveRestaurants() {
    localStorage.setItem('restaurants', JSON.stringify(restaurants));
}

// Update restaurant rating
function updateRestaurantRating(restaurant) {
    const sum = restaurant.reviews.reduce((total, review) => total + review.rating, 0);
    restaurant.rating = parseFloat((sum / restaurant.reviews.length).toFixed(1));
    saveRestaurants();
}

// Create restaurant card HTML
function createRestaurantCard(restaurant) {
    const stars = Math.round(restaurant.rating);
    const starIcons = '<i class="fas fa-star filled"></i>'.repeat(stars) + 
                     '<i class="far fa-star"></i>'.repeat(5 - stars);
    
    return `
        <div class="restaurant-card" data-id="${restaurant.id}">
            <div class="restaurant-image" style="background-image: url('${restaurant.image}')"></div>
            <div class="restaurant-info">
                <h3>${restaurant.name}</h3>
                <div class="meta-info">
                    <span class="cuisine-type">${restaurant.cuisine}</span>
                    <span class="price-range">${restaurant.priceRange}</span>
                    ${restaurant.rating >= 4 ? '<span class="top-rated-badge"><i class="fas fa-trophy"></i> Top Rated</span>' : ''}
                </div>
                <div class="rating">
                    ${starIcons}
                    <span class="rating-text">${restaurant.rating.toFixed(1)} (${restaurant.reviews.length} reviews)</span>
                </div>
                <p class="review-excerpt">"${restaurant.reviews[0]?.comment || 'Be the first to review!'}"</p>
                <a href="restaurant.html?id=${restaurant.id}" class="view-more">View Details</a>
            </div>
        </div>
    `;
}

// Add or update restaurant
function addRestaurantReview(reviewData) {
    let restaurant = restaurants.find(r => r.name.toLowerCase() === reviewData.name.toLowerCase());
    
    if (restaurant) {
        restaurant.reviews.push({
            author: reviewData.author,
            rating: reviewData.rating,
            comment: reviewData.comment,
            date: new Date().toLocaleDateString()
        });
        updateRestaurantRating(restaurant);
    } else {
        restaurant = {
            id: restaurants.length + 1,
            name: reviewData.name,
            cuisine: reviewData.cuisine,
            rating: reviewData.rating,
            reviews: [{
                author: reviewData.author,
                rating: reviewData.rating,
                comment: reviewData.comment,
                date: new Date().toLocaleDateString()
            }],
            image: getDefaultImage(reviewData.cuisine),
            location: "",
            priceRange: "$$"
        };
        restaurants.push(restaurant);
        saveRestaurants();
    }
    
    return restaurant;
}

// Get default image by cuisine
function getDefaultImage(cuisine) {
    const images = {
        italian: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb',
        mexican: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d',
        indian: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe',
        chinese: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
        american: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd'
    };
    return images[cuisine] || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0';
}

// Initialize
loadRestaurants();

// Update all pages
function updateAllPages() {
    if (typeof updateRestaurantDisplay === 'function') {
        updateRestaurantDisplay();
    }
}

// Star rating functionality
document.querySelectorAll('.star-rating i').forEach(star => {
    star.addEventListener('click', function() {
        const rating = parseInt(this.getAttribute('data-rating'));
        const container = this.parentElement;
        container.querySelectorAll('i').forEach((s, index) => {
            s.classList.toggle('filled', index < rating);
            s.classList.toggle('fas', index < rating);
            s.classList.toggle('far', index >= rating);
        });
        container.nextElementSibling.value = rating;
    });
});

// Review form submission
document.getElementById('review-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const reviewData = {
        name: this.querySelector('#restaurant-name').value,
        cuisine: this.querySelector('#cuisine-type').value,
        rating: parseInt(this.querySelector('#rating-value').value),
        author: this.querySelector('#reviewer-name').value,
        comment: this.querySelector('#review-text').value
    };
    
    addRestaurantReview(reviewData);
    this.reset();
    alert('Thank you for your review!');
    updateAllPages();
});