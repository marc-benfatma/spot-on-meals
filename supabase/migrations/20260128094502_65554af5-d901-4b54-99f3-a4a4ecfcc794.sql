-- Create restaurants table
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  cuisine_type TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  price_level INTEGER NOT NULL CHECK (price_level >= 1 AND price_level <= 3),
  rating DECIMAL(2, 1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  opening_hours JSONB NOT NULL DEFAULT '{}',
  phone_number TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (everyone can view restaurants)
CREATE POLICY "Restaurants are publicly viewable"
ON public.restaurants
FOR SELECT
USING (true);

-- Create policy for authenticated users to insert restaurants (for admin later)
CREATE POLICY "Authenticated users can insert restaurants"
ON public.restaurants
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy for authenticated users to update restaurants (for admin later)
CREATE POLICY "Authenticated users can update restaurants"
ON public.restaurants
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy for authenticated users to delete restaurants (for admin later)
CREATE POLICY "Authenticated users can delete restaurants"
ON public.restaurants
FOR DELETE
TO authenticated
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_restaurants_updated_at
BEFORE UPDATE ON public.restaurants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample restaurants for testing
INSERT INTO public.restaurants (name, address, cuisine_type, latitude, longitude, price_level, rating, opening_hours, phone_number, photo_urls) VALUES
('La Bella Italia', '123 Main Street', 'Italian', 48.8566, 2.3522, 2, 4.5, '{"monday": "11:00-22:00", "tuesday": "11:00-22:00", "wednesday": "11:00-22:00", "thursday": "11:00-22:00", "friday": "11:00-23:00", "saturday": "12:00-23:00", "sunday": "12:00-21:00"}', '+33 1 23 45 67 89', ARRAY['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400']),
('Sakura Sushi', '45 Cherry Lane', 'Japanese', 48.8576, 2.3532, 3, 4.8, '{"monday": "12:00-14:30,18:30-22:30", "tuesday": "12:00-14:30,18:30-22:30", "wednesday": "12:00-14:30,18:30-22:30", "thursday": "12:00-14:30,18:30-22:30", "friday": "12:00-14:30,18:30-23:00", "saturday": "12:00-23:00", "sunday": "closed"}', '+33 1 98 76 54 32', ARRAY['https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400']),
('Le Petit Bistro', '78 Boulevard Hausmann', 'French', 48.8546, 2.3502, 2, 4.2, '{"monday": "closed", "tuesday": "12:00-14:00,19:00-22:00", "wednesday": "12:00-14:00,19:00-22:00", "thursday": "12:00-14:00,19:00-22:00", "friday": "12:00-14:00,19:00-23:00", "saturday": "12:00-23:00", "sunday": "12:00-15:00"}', '+33 1 45 67 89 01', ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400']),
('Taco Loco', '22 Rue de Rivoli', 'Mexican', 48.8586, 2.3512, 1, 4.0, '{"monday": "11:00-22:00", "tuesday": "11:00-22:00", "wednesday": "11:00-22:00", "thursday": "11:00-22:00", "friday": "11:00-23:00", "saturday": "11:00-23:00", "sunday": "12:00-21:00"}', '+33 1 11 22 33 44', ARRAY['https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400']),
('Dragon Palace', '99 Avenue de l''Opera', 'Chinese', 48.8556, 2.3542, 2, 4.3, '{"monday": "11:30-14:30,18:00-22:30", "tuesday": "11:30-14:30,18:00-22:30", "wednesday": "11:30-14:30,18:00-22:30", "thursday": "11:30-14:30,18:00-22:30", "friday": "11:30-14:30,18:00-23:00", "saturday": "11:30-23:00", "sunday": "12:00-22:00"}', '+33 1 55 66 77 88', ARRAY['https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400']);