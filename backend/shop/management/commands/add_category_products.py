import urllib.parse
import urllib.request
import time
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from shop.models import Product


class Command(BaseCommand):
    help = 'Add 40 products across 4 categories with AI-generated images'

    def handle(self, *args, **kwargs):
        products = [
            # ===== MOBILE ACCESSORIES (10 products) =====
            {
                'name': 'MagSafe Phone Case',
                'description': 'Premium magnetic phone case with built-in MagSafe compatibility. Durable protection for your mobile device.',
                'price': 29.99,
                'stock_quantity': 150,
                'image_prompt': 'premium magsafe phone case isolated product photography clean background commercial'
            },
            {
                'name': 'Tempered Glass Screen Protector',
                'description': '9H hardness tempered glass screen protector for mobile phones. Crystal clear protection.',
                'price': 12.99,
                'stock_quantity': 200,
                'image_prompt': 'tempered glass screen protector for smartphone product shot studio lighting'
            },
            {
                'name': 'Fast Charging USB-C Cable',
                'description': '6ft braided USB-C charging cable for mobile phones and tablets. Fast charging support.',
                'price': 15.99,
                'stock_quantity': 180,
                'image_prompt': 'braided usb-c charging cable white background high quality product photo'
            },
            {
                'name': '20000mAh Power Bank',
                'description': 'High-capacity portable power bank for mobile devices. Dual USB ports for charging multiple devices.',
                'price': 45.99,
                'stock_quantity': 100,
                'image_prompt': 'sleek modern power bank 20000mah portable charger product photography'
            },
            {
                'name': 'Adjustable Phone Stand',
                'description': 'Aluminum adjustable phone stand for desk. Perfect for video calls and mobile viewing.',
                'price': 18.99,
                'stock_quantity': 120,
                'image_prompt': 'aluminum adjustable phone stand desk accessory minimal product design'
            },
            {
                'name': 'Wireless Charging Pad',
                'description': '15W fast wireless charging pad compatible with all Qi-enabled mobile phones.',
                'price': 24.99,
                'stock_quantity': 140,
                'image_prompt': 'wireless charging pad sleek design qi charger studio shot'
            },
            {
                'name': 'PopSocket Grip & Stand',
                'description': 'Collapsible grip and stand for mobile phones. Easy one-handed use.',
                'price': 9.99,
                'stock_quantity': 250,
                'image_prompt': 'phone grip stand accessory pop socket style colorful product'
            },
            {
                'name': 'Car Phone Mount',
                'description': 'Universal car phone holder for mobile devices. 360-degree rotation.',
                'price': 16.99,
                'stock_quantity': 130,
                'image_prompt': 'car phone mount dashboard holder product photography clean'
            },
            {
                'name': 'USB-C to Lightning Cable',
                'description': 'MFi certified USB-C to Lightning cable for iPhone and iPad. Fast charging.',
                'price': 19.99,
                'stock_quantity': 160,
                'image_prompt': 'usb-c to lightning cable white apple style product photo'
            },
            {
                'name': 'Phone Camera Lens Kit',
                'description': '3-in-1 mobile camera lens kit: wide-angle, macro, and fisheye for smartphone photography.',
                'price': 34.99,
                'stock_quantity': 80,
                'image_prompt': 'clip-on smartphone camera lens kit macro wide angle product photography'
            },

            # ===== LAPTOP ACCESSORIES (10 products) =====
            {
                'name': 'Aluminum Laptop Stand',
                'description': 'Ergonomic aluminum laptop stand riser. Fits all laptops up to 17 inches.',
                'price': 39.99,
                'stock_quantity': 110,
                'image_prompt': 'aluminum laptop stand riser ergonomic desk setup product photo'
            },
            {
                'name': 'Mechanical RGB Keyboard',
                'description': 'Wireless mechanical keyboard with RGB backlight. Perfect for laptop setup.',
                'price': 89.99,
                'stock_quantity': 75,
                'image_prompt': 'mechanical keyboard rgb backlight modern tech product photography'
            },
            {
                'name': 'Wireless Gaming Mouse',
                'description': 'Ergonomic wireless mouse with adjustable DPI. Ideal for laptop gaming and productivity.',
                'price': 49.99,
                'stock_quantity': 95,
                'image_prompt': 'wireless gaming mouse ergonomic rgb lighting product shot'
            },
            {
                'name': '11-in-1 USB-C Hub',
                'description': 'Multiport USB-C hub docking station for laptops. HDMI, SD card, USB 3.0 ports.',
                'price': 59.99,
                'stock_quantity': 85,
                'image_prompt': 'usb-c hub dongle multiport adapter aluminum laptop accessory'
            },
            {
                'name': 'Laptop Sleeve 15.6 inch',
                'description': 'Premium padded laptop sleeve bag. Water-resistant protection for 15.6" laptops.',
                'price': 24.99,
                'stock_quantity': 140,
                'image_prompt': 'laptop sleeve protective case 15 inch grey minimal product photo'
            },
            {
                'name': 'Laptop Cooling Pad',
                'description': 'RGB laptop cooling pad with 6 quiet fans. Prevents overheating.',
                'price': 34.99,
                'stock_quantity': 100,
                'image_prompt': 'laptop cooling pad with fans rgb gaming accessory product'
            },
            {
                'name': '1080p HD Webcam',
                'description': 'Full HD webcam with built-in microphone for laptops. Perfect for video calls.',
                'price': 54.99,
                'stock_quantity': 90,
                'image_prompt': 'hd webcam usb camera for computer streaming product photography'
            },
            {
                'name': 'Portable External SSD 1TB',
                'description': '1TB portable external SSD drive. Ultra-fast storage for laptops.',
                'price': 119.99,
                'stock_quantity': 60,
                'image_prompt': 'portable ssd external hard drive compact storage metal finish'
            },
            {
                'name': 'Cable Management Kit',
                'description': 'Complete cable organizer kit for laptop desk setup. Keeps cables tidy.',
                'price': 14.99,
                'stock_quantity': 170,
                'image_prompt': 'cable organizer clips velcro ties management kit desk setup'
            },
            {
                'name': 'Monitor Stand Riser',
                'description': 'Wooden monitor stand with storage. Perfect for laptop dual-screen setup.',
                'price': 32.99,
                'stock_quantity': 105,
                'image_prompt': 'wooden monitor stand riser desk organizer office setup product'
            },

            # ===== AUDIO DEVICES (10 products) =====
            {
                'name': 'Wireless Earbuds Pro',
                'description': 'Premium wireless earbuds with active noise cancellation. 30-hour battery life.',
                'price': 159.99,
                'stock_quantity': 120,
                'image_prompt': 'wireless earbuds in charging case pro white elegant product shot'
            },
            {
                'name': 'Over-Ear Headphones',
                'description': 'Studio-quality over-ear headphones with deep bass. Comfortable cushioned design.',
                'price': 129.99,
                'stock_quantity': 80,
                'image_url': 'https://images.unsplash.com/photo-1505740420926-4d51c7c2b299?auto=format&fit=crop&w=800&q=80',
                'image_prompt': 'premium over-ear headphones wireless studio quality product photography'
            },
            {
                'name': 'Portable Bluetooth Speaker',
                'description': 'Waterproof portable Bluetooth speaker. 360-degree sound with 20-hour battery.',
                'price': 79.99,
                'stock_quantity': 95,
                'image_prompt': 'portable bluetooth speaker waterproof modern design product shot'
            },
            {
                'name': 'USB Condenser Microphone',
                'description': 'Professional USB microphone for podcasting and streaming. Crystal clear audio.',
                'price': 89.99,
                'stock_quantity': 70,
                'image_prompt': 'usb microphone podcast streaming mic studio equipment product'
            },
            {
                'name': 'Gaming Headset RGB',
                'description': 'RGB gaming headset with 7.1 surround sound. Noise-canceling microphone.',
                'price': 69.99,
                'stock_quantity': 110,
                'image_prompt': 'gaming headset with mic rgb lighting futuristic product detail'
            },
            {
                'name': '3.5mm Audio Cable Gold-Plated',
                'description': 'Premium gold-plated 3.5mm auxiliary audio cable. 6ft braided design.',
                'price': 11.99,
                'stock_quantity': 200,
                'image_prompt': 'aux cable audio cord 3.5mm jack coil product photography'
            },
            {
                'name': 'Headphone Stand',
                'description': 'RGB headphone stand holder with USB charging ports. Aluminum construction.',
                'price': 29.99,
                'stock_quantity': 130,
                'image_prompt': 'headphone stand holder rgb gaming accessory desk setup'
            },
            {
                'name': 'Soundbar for TV',
                'description': '32-inch soundbar with subwoofer. Enhanced audio for home entertainment.',
                'price': 149.99,
                'stock_quantity': 55,
                'image_prompt': 'soundbar speaker for tv home theater system sleek black product'
            },
            {
                'name': 'Silicone Earphone Case',
                'description': 'Protective silicone case for wireless earbuds. Shock-resistant design.',
                'price': 12.99,
                'stock_quantity': 180,
                'image_prompt': 'silicone case cover for airpods earbuds colorful product photo'
            },
            {
                'name': 'Audio Splitter 3.5mm',
                'description': 'Dual headphone audio splitter adapter. Share audio with friends.',
                'price': 8.99,
                'stock_quantity': 220,
                'image_prompt': 'audio splitter adapter 3.5mm dual headphone jack product'
            },

            # ===== SMART WEARABLES (10 products) =====
            {
                'name': 'Smartwatch Series 7',
                'description': 'Advanced smartwatch with fitness tracking, heart rate monitor, and GPS. iOS and Android compatible.',
                'price': 279.99,
                'stock_quantity': 65,
                'image_prompt': 'smartwatch digital watch face fitness tracker sleek product photography'
            },
            {
                'name': 'Fitness Tracker Band',
                'description': 'Smart fitness band with step counter, sleep tracking, and notifications.',
                'price': 49.99,
                'stock_quantity': 140,
                'image_prompt': 'fitness tracker smart band wristband sport detailed product shot'
            },
            {
                'name': 'Premium Smart Band',
                'description': 'AMOLED display smart band with SpO2 and heart rate monitoring.',
                'price': 89.99,
                'stock_quantity': 95,
                'image_prompt': 'premium smart band amoled screen wearable tech product'
            },
            {
                'name': 'VR Headset Gaming',
                'description': 'Virtual reality headset for immersive gaming. Compatible with PC and console.',
                'price': 299.99,
                'stock_quantity': 45,
                'image_prompt': 'vr headset virtual reality goggles white gaming product'
            },
            {
                'name': 'Smart Glasses',
                'description': 'Bluetooth smart glasses with built-in speakers and microphone. Hands-free calls.',
                'price': 199.99,
                'stock_quantity': 50,
                'image_prompt': 'smart glasses eyewear with technology modern design product'
            },
            {
                'name': 'Action Camera Watch',
                'description': 'Wearable action camera smartwatch. 4K video recording.',
                'price': 249.99,
                'stock_quantity': 40,
                'image_prompt': 'smartwatch with camera lens action cam wearable gadget'
            },
            {
                'name': 'Health Monitor Watch',
                'description': 'Health monitoring smartwatch with ECG, blood pressure, and glucose tracking.',
                'price': 189.99,
                'stock_quantity': 70,
                'image_prompt': 'health monitoring smartwatch medical sensor watch product photography'
            },
            {
                'name': 'GPS Running Watch',
                'description': 'GPS smartwatch for runners. Track distance, pace, and routes.',
                'price': 159.99,
                'stock_quantity': 85,
                'image_prompt': 'gps running watch sport digital rugged design product'
            },
            {
                'name': 'Sleep Tracker Ring',
                'description': 'Smart ring for sleep tracking and activity monitoring. 7-day battery life.',
                'price': 299.99,
                'stock_quantity': 55,
                'image_prompt': 'smart ring wearable technology finger jewelry tech product'
            },
            {
                'name': 'Kids Smartwatch',
                'description': 'GPS smartwatch for kids with SOS button and geofencing. Parental controls.',
                'price': 79.99,
                'stock_quantity': 100,
                'image_prompt': 'kids smartwatch colorful durable design photo'
            },
        ]

        created_count = 0
        updated_count = 0

        for product_data in products:
            product, created = Product.objects.update_or_create(
                name=product_data['name'],
                defaults={
                    'description': product_data['description'],
                    'price': product_data['price'],
                    'stock_quantity': product_data['stock_quantity'],
                    'is_active': True
                }
            )

            # Download and save image
            if 'image_prompt' in product_data and (not product.image or created):
                try:
                    self.stdout.write(f"Generating image for {product.name}...")
                    
                    # Construct Pollinations.ai URL with prompts
                    prompt = urllib.parse.quote(product_data['image_prompt'])
                    # w=800 h=800 for square clear images, nologo=true (implied)
                    image_url = f"https://image.pollinations.ai/prompt/{prompt}?width=800&height=800&nologo=true"
                    
                    req = urllib.request.Request(
                        image_url,
                        headers={'User-Agent': 'Mozilla/5.0'}
                    )
                    
                    with urllib.request.urlopen(req, timeout=30) as response:
                        image_content = ContentFile(response.read())
                        filename = f"{product.name.lower().replace(' ', '_')}.jpg"
                        product.image.save(filename, image_content, save=True)
                        time.sleep(1) # Be nice to the API
                        
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Failed to save image for {product.name}: {str(e)}"))

            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully processed {len(products)} products: '
                f'{created_count} created, {updated_count} updated'
            )
        )
