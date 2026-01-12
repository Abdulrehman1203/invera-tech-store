from django.core.management.base import BaseCommand
from shop.models import Product
import os
from django.conf import settings


class Command(BaseCommand):
    help = 'Assign existing local product images to products based on name matching'

    def handle(self, *args, **kwargs):
        media_products_path = os.path.join(settings.MEDIA_ROOT, 'products')
        
        # Get all image files in the products directory
        if not os.path.exists(media_products_path):
            self.stdout.write(self.style.ERROR(f'Media products directory not found: {media_products_path}'))
            return
        
        image_files = [f for f in os.listdir(media_products_path) 
                      if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.avif'))]
        
        self.stdout.write(f'Found {len(image_files)} images in media/products/')
        
        # Manual mapping of product names to image files
        product_image_map = {
            'MagSafe Phone Case': 'magsafe_phone_case.jpg',
            'Tempered Glass Screen Protector': 'tempered_glass_screen_protector.jpg',
            'Fast Charging USB-C Cable': 'fast_charging_usb-c_cable.jpg',
            '20000mAh Power Bank': '20000mah_power_bank.jpg',
            'Adjustable Phone Stand': 'adjustable_phone_stand.jpg',
            'Wireless Charging Pad': 'wireless_charging_pad.png',
            'PopSocket Grip & Stand': 'popsocket_grip__stand.jpg',
            'Car Phone Mount': 'car_phone_mount.jpg',
            'USB-C to Lightning Cable': 'usb-c_to_lightning_cable.jpg',
            'Phone Camera Lens Kit': 'phone_camera_lens_kit.jpg',
            
            'Aluminum Laptop Stand': 'aluminum_laptop_stand.jpg',
            'Mechanical RGB Keyboard': 'keyboard.png',
            'Wireless Gaming Mouse': 'wireless_gaming_mouse.jpg',
            '11-in-1 USB-C Hub': '11-in-1_usb-c_hub.jpg',
            'Laptop Sleeve 15.6 inch': 'laptop_sleeve_15.6_inch.jpg',
            'Laptop Cooling Pad': 'laptop_cooling_pad.jpg',
            '1080p HD Webcam': '1080p_hd_webcam.jpg',
            'Portable External SSD 1TB': 'external_ssd.png',
            'Cable Management Kit': 'cable_kit.png',
            'Monitor Stand Riser': 'monitor_stand_riser.jpg',
            
            'Wireless Earbuds Pro': 'earbuds.png',
            'Over-Ear Headphones': 'headphones.png',
            'Portable Bluetooth Speaker': 'portable_bluetooth_speaker.jpg',
            'USB Condenser Microphone': 'usb_condenser_microphone.jpg',
            'Gaming Headset RGB': 'gaming_headset_rgb.jpg',
            '3.5mm Audio Cable Gold-Plated': '3.5mm_audio_cable_gold-plated.jpg',
            'Headphone Stand': 'headphone_stand.jpg',
            'Soundbar for TV': 'soundbar_for_tv.jpg',
            'Silicone Earphone Case': 'silicone_earphone_case.jpg',
            'Audio Splitter 3.5mm': 'audio_splitter_3.5mm.jpg',
            
            'Smartwatch Series 7': 'smartwatch_series_7.jpg',
            'Fitness Tracker Band': 'fitness_tracker_band.jpg',
            'Premium Smart Band': 'premium_smart_band.jpg',
            'VR Headset Gaming': 'vr_headset_gaming.jpg',
            'Smart Glasses': 'smart_glasses.jpg',
            'Action Camera Watch': 'action_camera_watch.jpg',
            'Health Monitor Watch': 'health_monitor_watch.jpg',
            'GPS Running Watch': 'gps_running_watch.jpg',
            'Sleep Tracker Ring': 'sleep_tracker_ring.jpg',
            'Kids Smartwatch': 'kids_smartwatch.jpg',
        }
        
        updated_count = 0
        not_found_count = 0
        
        for product in Product.objects.all():
            if product.name in product_image_map:
                image_filename = product_image_map[product.name]
                
                # Check if the image file exists
                if image_filename in image_files or any(img.startswith(image_filename.rsplit('.', 1)[0]) for img in image_files):
                    # Find the actual file (might have different extension or suffix)
                    actual_file = next((f for f in image_files if f.startswith(image_filename.rsplit('.', 1)[0])), image_filename)
                    
                    product.image = f'products/{actual_file}'
                    product.save()
                    updated_count += 1
                    self.stdout.write(self.style.SUCCESS(f'✓ Updated {product.name} -> {actual_file}'))
                else:
                    not_found_count += 1
                    self.stdout.write(self.style.WARNING(f'✗ Image not found for {product.name}: {image_filename}'))
            else:
                not_found_count += 1
                self.stdout.write(self.style.WARNING(f'✗ No mapping for product: {product.name}'))
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Updated {updated_count} products'))
        if not_found_count > 0:
            self.stdout.write(self.style.WARNING(f'⚠️  {not_found_count} products without images'))
