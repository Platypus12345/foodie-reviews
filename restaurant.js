// Restaurant Data Model
class Restaurant {
    constructor(id, name, cuisine, rating, review, image, location = '', priceRange = '$$') {
        this.id = id;
        this.name = name;
        this.cuisine = cuisine;
        this.rating = rating;
        this.review = review;
        this.image = image;
        this.location = location;
        this.priceRange = priceRange;
        this.reviews = [];
    }

    addReview(review) {
        this.reviews.push(review);
        // Recalculate average rating
        if (this.reviews.length > 0) {
            const sum = this.reviews.reduce((acc, curr) => acc + curr.rating, 0);
            this.rating = Math.round(sum / this.reviews.length);
        }
    }
}

// Sample Restaurant Data
let restaurants = [
    new Restaurant(
        1,
        "Pasta Palace", 
        "italian", 
        4, 
        "The best pasta in town! Their carbonara is to die for.",
        "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb",
        "123 Main St",
        "$$$"
    ),
    // Add other restaurants similarly
];

// Restaurant Display Functions
function createRestaurantCard(restaurant, detailed = false) {
    const card = document.createElement('div');
    card.className = 'restaurant-card';
    card.dataset.id = restaurant.id;
    
    const stars = '<i class="fas fa-star filled"></i>'.repeat(restaurant.rating) + 
                  '<i class="far fa-star"></i>'.repeat(5 - restaurant.rating);
    
    let cardHTML = `
        <div class="restaurant-image" style="background-image: url('${restaurant.image}')"></div>
        <div class="restaurant-info">
            <h3>${restaurant.name}</h3>
            <div class="meta-info">
                <span class="cuisine-type">${restaurant.cuisine.charAt(0).toUpperCase() + restaurant.cuisine.slice(1)}</span>
                <span class="price-range">${restaurant.priceRange}</span>
                <span class="location">${restaurant.location}</span>
            </div>
            <div class="rating">${stars}</div>
    `;
    
    if (detailed) {
        cardHTML += `
            <p class="restaurant-description">${restaurant.review}</p>
            <div class="reviews-section">
                <h4>Reviews</h4>
                ${restaurant.reviews.map(review => `
                    <div class="review">
                        <div class="review-rating">
                            ${'<i class="fas fa-star filled"></i>'.repeat(review.rating)}
                            ${'<i class="far fa-star"></i>'.repeat(5 - review.rating)}
                        </div>
                        <p class="review-text">${review.text}</p>
                        <p class="review-author">- ${review.author}</p>
                    </div>
                `).join('')}
            </div>
            <button class="add-review-btn">Add Your Review</button>
        `;
    } else {
        cardHTML += `
            <p class="review-excerpt">${restaurant.review.substring(0, 100)}...</p>
            <a href="restaurant.html?id=${restaurant.id}" class="view-more">View Details</a>
        `;
    }
    
    cardHTML += `</div>`;
    card.innerHTML = cardHTML;
    
    if (detailed) {
        const reviewBtn = card.querySelector('.add-review-btn');
        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => {
                showReviewForm(restaurant.id);
            });
        }
    }
    
    return card;
}

// Restaurant Filtering
function filterRestaurants(criteria = {}) {
    return restaurants.filter(restaurant => {
        return (
            (!criteria.cuisine || restaurant.cuisine === criteria.cuisine) &&
            (!criteria.minRating || restaurant.rating >= criteria.minRating) &&
            (!criteria.searchTerm || 
             restaurant.name.toLowerCase().includes(criteria.searchTerm) ||
             restaurant.review.toLowerCase().includes(criteria.searchTerm))
        );
    });
}

// Single Restaurant Page Functions
function loadRestaurantDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantId = parseInt(urlParams.get('id'));
    
    if (restaurantId) {
        const restaurant = restaurants.find(r => r.id === restaurantId);
        if (restaurant) {
            const container = document.getElementById('restaurant-details');
            container.appendChild(createRestaurantCard(restaurant, true));
        } else {
            window.location.href = 'restaurants.html';
        }
    } else {
        window.location.href = 'restaurants.html';
    }
}

// Review Form Handling
function showReviewForm(restaurantId) {
    const formHTML = `
        <div class="review-form-overlay">
            <div class="review-form-container">
                <h3>Add Your Review</h3>
                <form id="restaurant-review-form">
                    <input type="hidden" id="restaurant-id" value="${restaurantId}">
                    <div class="form-group">
                        <label for="review-author">Your Name:</label>
                        <input type="text" id="review-author" required>
                    </div>
                    <div class="form-group">
                        <label>Rating:</label>
                        <div class="star-rating">
                            ${[1,2,3,4,5].map(i => `<i class="far fa-star" data-rating="${i}"></i>`).join('')}
                        </div>
                        <input type="hidden" id="review-rating" required>
                    </div>
                    <div class="form-group">
                        <label for="review-text">Review:</label>
                        <textarea id="review-text" rows="4" required></textarea>
                    </div>
                    <button type="submit" class="submit-btn">Submit Review</button>
                    <button type="button" class="cancel-btn">Cancel</button>
                </form>
            </div>
        </div>
    `;
    
    const formContainer = document.createElement('div');
    formContainer.innerHTML = formHTML;
    document.body.appendChild(formContainer);
    
    // Star rating functionality
    const stars = formContainer.querySelectorAll('.star-rating i');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            document.getElementById('review-rating').value = rating;
            
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('fas', 'filled');
                    s.classList.remove('far');
                } else {
                    s.classList.add('far');
                    s.classList.remove('fas', 'filled');
                }
            });
        });
    });
    
    // Form submission
    const form = formContainer.querySelector('#restaurant-review-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const restaurantId = parseInt(document.getElementById('restaurant-id').value);
        const author = document.getElementById('review-author').value;
        const rating = parseInt(document.getElementById('review-rating').value);
        const text = document.getElementById('review-text').value;
        
        const restaurant = restaurants.find(r => r.id === restaurantId);
        if (restaurant) {
            restaurant.addReview({
                author,
                rating,
                text,
                date: new Date().toLocaleDateString()
            });
            
            // Refresh the display
            document.body.removeChild(formContainer);
            if (window.location.pathname.includes('restaurant.html')) {
                loadRestaurantDetails();
            }
        }
    });
    
    // Cancel button
    const cancelBtn = formContainer.querySelector('.cancel-btn');
    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(formContainer);
    });
}

// Initialize Restaurant Page
if (window.location.pathname.includes('restaurant.html')) {
    document.addEventListener('DOMContentLoaded', loadRestaurantDetails);
}

// Export functions if using modules
// export { createRestaurantCard, filterRestaurants, loadRestaurantDetails };