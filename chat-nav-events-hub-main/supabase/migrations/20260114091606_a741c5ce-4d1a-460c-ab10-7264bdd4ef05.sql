-- Create lost_and_found table for tracking lost/found items and persons
CREATE TABLE public.lost_and_found (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
    category TEXT NOT NULL CHECK (category IN ('person', 'child', 'elderly', 'item', 'document', 'other')),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    last_seen_location TEXT,
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lost_and_found ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (anyone can view and create reports)
CREATE POLICY "Anyone can view lost and found reports" 
ON public.lost_and_found 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create lost and found reports" 
ON public.lost_and_found 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_lost_found_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_lost_found_updated_at
BEFORE UPDATE ON public.lost_and_found
FOR EACH ROW
EXECUTE FUNCTION public.update_lost_found_updated_at();